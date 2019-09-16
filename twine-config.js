let atrium = `public/gp`;
let imgAtrium = `public/img-ssl-twineall/u/`; //img-ssl.twineall.com/
let mimeTitle = `Content-Type`;

module.exports = {
  CSSDeck: `${atrium}/css/`,
  portfolio: `${imgAtrium}360x640/`,
  electCSSTrims: {'{ ': /\s*{/g, '{': /{\s*/g, ';': /;\s*/g, ' }': /\s*}/g, '}': /}\s*/g},
  nullZoomCSS: `width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no`,
  electMimeTypes: {
    html: {mimeTitle: `text/html`},
    json: {mimeTitle: `application/json`}
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
    users: `create table if not exists users (altid TEXT not null, btime TEXT not null, idsum VARCHAR(320) not null, sex TEXT not null)`,
    usermeta: `create table if not exists usermeta (bio TEXT not null,chain VARCHAR(320) not null,idsum VARCHAR(320) not null,mail TEXT not null,mug TEXT not null,pass TEXT not null)`,
    getMono: `select * from ??`,
    getElects: `select * from suggests_{refs}`,
    equateElectsSex: `select * from suggests_{refs} where sex='{idSex}'`,
    equateMail: `select * from temp_users where mail='{idMail}'`,
    getChain: `select * from temp_users where idsum='{refs}'`,
    getPlus: `select * from ?? where ?? = ?`,
    insert: `insert into ?? set ?`,
    getPlusAnonym: `select * from {table} where {field}='{fieldValue}' and {fieldPlus}='{fieldValuePlus}'`,
    waits: `create table awaits_{mailSum} (idsum VARCHAR(320) not null)`,
    twines: `create table accepts_{mailSum} (idsum VARCHAR(320) not null)`,
    nulls: `create table nulls_{mailSum} (idsum VARCHAR(320) not null)`,
    txts: `create table textchain_{mailSum} (idsum VARCHAR(320) not null,ptime TEXT not null,idsum2 VARCHAR(320) not null,txtstring TEXT not null,txtstring_hash TEXT not null)`,
    txtMeta: `create table textsstat_{mailSum} (idsum VARCHAR(320) not null,posttally INT not null,ptime TEXT not null,tally INT not null)`,
    refs: `create table suggests_{mailSum} (btime TEXT not null,idsum VARCHAR(320) not null, sex TEXT not null)`,
    reco: `create table recommends_{mailSum} (btime TEXT not null,idsum VARCHAR(320) not null, sex TEXT not null)`,
    joinAny: `select * from {mailSum_Tab}, {mailSum_Tab_} where {mailSum_Tab}.{field}={mailSum_Tab_}.{field}`,
    fieldValueAlterMono: `update {mailSum_Tab} set {field} = '{fieldValue}' where {field_2} = '{fieldValue_2}'`,
    deleteCol: `delete from {mailSum_Tab} where {field} = '{fieldValue}'`,
    fieldMatch: `select * from {tab} join {tab_2} on {tab}.{field}={tab_2}.{field} where {tab}.{field} = '{fieldValue}'`,
    mismatchMultiMeta: `select * from {tab} left join {tab_2} on {tab}.{field}={tab_2}.{field} where {tab_2}.{field} is null and {tab}.{meta}='{metaValue}'`,
    //tabDel,
  }
}
