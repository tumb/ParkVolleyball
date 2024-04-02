
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";

export default function UploadPlayerPicture() {
  const router = useRouter();
  const [person, setPerson] = useState(null);
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [validEmails, setValidEmails] = useState([]);

  useEffect(() => {
    async function fetchPerson() {
      const { email } = router.query;
      if (email) {
        try {
          const { data, error } = await supabase
            .from("persons")
            .select("firstname, lastname")
            .eq("email", email)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setPerson(data);

            // Fetch existing image URL for the person
            const { data: playerData, error: playerError } = await supabase
              .from("player")
              .select("image_url")
              .eq("email", email)
              .single();

            if (playerError) {
              throw playerError;
            }

            if (playerData) {
              setExistingImageUrl(playerData.image_url);
            }
          } else {
            // If the email is valid but not found in the database, fetch valid emails and first names
            const { data: personsData, error: personsError } = await supabase
              .from("persons")
              .select("email, firstname")
              .order("firstname");

            if (personsError) {
              throw personsError;
            }

            if (personsData) {
              setValidEmails(personsData);
            }
          }
        } catch (error) {
          console.error("Error fetching person:", error.message);
        }
      }
    }

    fetchPerson();
  }, [router.query]);

  const handleEmailClick = (email) => {
    router.push(`/uploadPlayerPicture?email=${email}`);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewURL(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      // Upload new image
      const { data: imageData, error: uploadError } = await supabase.storage
        .from("playerpictures")
        .upload(`player_pictures/${person.email}/${file.name}`, file);

      if (uploadError) {
        throw uploadError;
      }

      const imageUrl = imageData.Key;

      // Update image URL in the 'player' table
      await supabase.from("player").upsert({ email: person.email, image_url: imageUrl });

      alert("File uploaded successfully!");
      setExistingImageUrl(imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error.message);
      alert("Error uploading file. Please try again.");
    }
  };

  return (
    <div>
      {person && !existingImageUrl && (
        <div>
          <p>
            {person.firstname} {person.lastname}, please upload a PNG or JPG file of your face. This will help other people find you when they play against you.
          </p>
          <input type="file" accept=".png,.jpg" onChange={handleFileChange} />
          {previewURL && <img src={previewURL} alt="Preview" style={{ maxWidth: "100%", maxHeight: "300px", marginTop: "10px" }} />}
          <button onClick={handleSubmit}>Upload</button>
        </div>
      )}
      {!person && validEmails.length > 0 && (
        <div>
          <p>
            The email you entered is valid but not found in the database. Please select from the list below:
          </p>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>First Name</th>
              </tr>
            </thead>
            <tbody>
              {validEmails.map((entry) => (
                <tr key={entry.email} onClick={() => handleEmailClick(entry.email)} style={{ cursor: "pointer" }}>
                  <td>{entry.email}</td>
                  <td>{entry.firstname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!person && validEmails.length === 0 && (
        <p>
          The email you entered is not valid or not found in the database.
        </p>
      )}
    </div>
  );
}
