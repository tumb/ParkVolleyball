
create sequence team_out_id_seq 
start_with 1
increment by 1 ; 

create table team_out (
team_out_id int default nextval('team_out_id_seq'),
date_out varchar(20) ,
teamid int,
leagueid int
);


select * 
from player 
where playerid > 180
order by lastname asc
; 

delete from player
where playerid in (220)
;