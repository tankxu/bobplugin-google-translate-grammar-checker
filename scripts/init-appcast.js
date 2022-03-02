const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const package = require('../package.json');
const plugInfo = require('../src/info.json');
const plugAppcast = require('../src/appcast.json');

const githubRelease = `https://raw.githubusercontent.com/tankxu/bobplugin-google-translate-grammar-checker/releases/download`;

module.exports = () => {
  const pkgName = 'google-translate-grammar-checker';
  const pkgPath = path.resolve(__dirname, `../release/${pkgName}-v${plugInfo.version}.bobplugin`);
  const appcastPath = path.join(__dirname, '../src/appcast.json');

  const fileBuffer = fs.readFileSync(pkgPath);
  const sum = crypto.createHash('sha256');
  sum.update(fileBuffer);
  const hex = sum.digest('hex');

  const version = {
    version: package.version,
    desc: 'https://github.com/tankxu/bobplugin-google-translate-grammar-checker/blob/master/CHANGELOG.md',
    sha256: hex,
    url: `${githubRelease}/v${package.version}/google-translate-grammar-checker-v${package.version}.bobplugin`,
    minBobVersion: plugInfo.minBobVersion,
  };

  let versions = (plugAppcast && plugAppcast.versions) || [];
  if (!Array.isArray(versions)) versions = [];
  const index = versions.findIndex((v) => v.version === package.version);
  if (index === -1) {
    versions.splice(0, 0, version);
  } else {
    versions.splice(index, 1, version);
  }
  const appcastData = { identifier: plugInfo.identifier, versions };
  fs.outputJSONSync(appcastPath, appcastData, { spaces: 2 });
};
