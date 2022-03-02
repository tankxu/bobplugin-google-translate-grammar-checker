import * as Bob from '@bob-plug/core';
import { getSupportLanguages, standardToNoStandard } from './lang';
import { _translate as translateByWeb } from './google-translate';
import { _translate as translateByRPC } from './google-translate-rpc';
import { _translate as translateByMobile } from './google-translate-mobile';

var formatString = require('./libs/human-string');

export function supportLanguages(): Bob.supportLanguages {
  return getSupportLanguages();
}

// https://ripperhe.gitee.io/bob/#/plugin/quickstart/translate
function translateJob(query: Bob.TranslateQuery) {
  const { text = '', detectFrom, detectTo } = query;
  const str = formatString(text);
  const from = standardToNoStandard(detectFrom);
  const to = standardToNoStandard(detectTo);
  const params = { from, to, tld: Bob.api.getOption('tld'), cache: Bob.api.getOption('cache') };

  const translateVersion = Bob.api.getOption('version');
  let res;
  if (translateVersion === 'rpc') {
    res = translateByRPC(str, params);
  } else if (translateVersion === 'tmp') {
    res = /[^\S\r\n]+/g.test(text) ? translateByMobile(str, params) : translateByRPC(str, params);
  } else {
    res = translateByWeb(str, params);
  }

  return res;
}

export function translate(query: Bob.TranslateQuery, completion: Bob.Completion) {
  Bob.api.$log.info(JSON.stringify(query));

  translateJob(query)
    .then((result) => {
      // Bob.api.$log.info(JSON.stringify(result));

      let queryReverse = query;
      let fromLang = query.detectFrom;
      let toLang = query.detectTo;
      let reverseText = result.toParagraphs.join('\n');

      queryReverse.detectFrom = toLang;
      queryReverse.detectTo = fromLang;
      queryReverse.text = reverseText;

      // Bob.api.$log.info(JSON.stringify(queryReverse));

      return translateJob(queryReverse);
    })
    .then((result) => {
      // Bob.api.$log.info(JSON.stringify(result));
      return completion({ result });
    })
    .catch((error) => {
      Bob.api.$log.error(JSON.stringify(error));
      if (error?.type) return completion({ error });
      completion({ error: Bob.util.error('api', '插件出错', error) });
    });
}
