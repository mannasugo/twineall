let atrium = `public/gp`;
let mimeTitle = `Content-Type`;

module.exports = {
  CSSDeck: `${atrium}/css/`,
  electCSSTrims: {'{ ': /\s*{/g, '{': /{\s*/g, ';': /;\s*/g, ' }': /\s*}/g, '}': /}\s*/g},
  nullZoomCSS: `width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no`,
  electMimeTypes: {
    html: {mimeTitle: `text/html`}
  },
  SqlConfig: {
    h: `localhost`,
    u: `root`,
    p: `Mann2asugo`,
    d: `twine`,
  },
  SqlQuery: {
    twine: `create database if not exists twine`,
    tempusers: `create table if not exists temp_users (altid TEXT not null,btime TEXT not null,chain VARCHAR(320) not null,idsum VARCHAR(320) not null,jtime TEXT not null,mail TEXT not null,reco VARCHAR(320) not null,referer VARCHAR(320) not null,sex TEXT not null)`,
    users: `create table if not exists users (altid TEXT not null, btime TEXT not null, idsum VARCHAR(320) not null)`,
    usermeta: `create table if not exists usermeta (bio TEXT not null,chain VARCHAR(320) not null,idsum VARCHAR(320) not null,mail TEXT not null,mug TEXT not null,pass TEXT not null)`,
    getMono: `select * from ??`,
  }
}
