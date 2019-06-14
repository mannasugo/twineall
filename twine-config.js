let atrium = `public/gp`;

module.exports = {
  CSSDeck: `${atrium}/css`,
  SQLPassConfig: {
    h: localhost,
    u: root,
    p: Mann2asugo,
    d: twine,
  },
  SqlQuery: {
    twine: `create database if not exists twine`,
    tempusers: `create table if not exists temp_users (altid TEXT not null,btime TEXT not null,chain VARCHAR(320) not null,idsum VARCHAR(320) not null,jtime TEXT not null,mail TEXT not null,reco VARCHAR(320) not null,referer VARCHAR(320) not null,sex TEXT not null)`,
    users: `create table if not exists users (altid TEXT not null, btime TEXT not null, idsum VARCHAR(320) not null)`,
    usermeta: `create table if not exists usermeta (bio TEXT not null,chain VARCHAR(320) not null,idsum VARCHAR(320) not null,mail TEXT not null,mug TEXT not null,pass TEXT not null)`,
  }
}
