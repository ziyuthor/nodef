// dao/userSqlMapping.js
// CRUD SQLÓï¾ä
var sqlcmd = {
  insert:'INSERT INTO user(id, name, age) VALUES(0,?,?)',
  update:'update user set name=?, age=? where id=?',
  delete: 'delete from user where id=?',
  queryById: 'select * from user where id=?',
  queryAll: 'select vp_product_config.corp_code, vp_product_config.product_id, vp_product_config.priority, vp_product_config.package_id, vp_channel.isp, vp_channel.channel_id, vp_channel.province, vp_channel.serving_area  from vp_product_config, vp_package, vp_channel  where  vp_product_config.package_id=vp_package.package_id and vp_package.channel_id=vp_channel.channel_id and vp_product_config.corp_code='100000' order by vp_product_config.package_id'
};

module.exports = sqlcmd;