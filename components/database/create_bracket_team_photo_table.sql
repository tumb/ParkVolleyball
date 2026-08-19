create sequence bracket_team_photo_id_seq
start with 1
increment by 1 ;

create table bracket_team_photo (
  id int default nextval('bracket_team_photo_id_seq'),
  bracketid int not null,
  teamid int not null,
  photo_type varchar(64) not null,
  image_url varchar(1024),
  storage_path varchar(1024),
  created_at timestamp default now()
);

alter table bracket_team_photo disable row level security;

alter table bracket_team_photo
  add constraint bracket_team_photo_pkey primary key (id);

alter table bracket_team_photo
  add constraint bracket_team_photo_unique_per_team_per_type unique (bracketid, teamid, photo_type);

alter table bracket_team_photo
  add constraint bracket_team_photo_bracketid_fkey foreign key (bracketid) references bracket(bracketid);

alter table bracket_team_photo
  add constraint bracket_team_photo_teamid_fkey foreign key (teamid) references team(teamid);
