'use strict';

const $buttonSubmit = $('#button-submit');
const $inputQuery = $('#input-query');
const $inputFromLang = $('#input-from-lang');
const $inputToLang = $('#input-to-lang');
const $outputResult = $('#output-result');

function gatherData() {
  return {
    query: $inputQuery.val(),
    fromLang: $inputFromLang.val(),
    toLang: $inputToLang.val(),
  };
}

function searchWikiArticle(query, fromLang, callback) {
  const url = `https://${fromLang}.wikipedia.org/w/api.php`;
  const args = {
    format: 'json',
    action: 'query',
    list: 'search',
    srsearch: query,
  };
  $.ajax({
    url: url,
    data: args,
    dataType: 'jsonp',
    success: (data) => {
      const firstResult = data['query']['search'][0];
      if (!firstResult) {
        // TODO: error
        return;
      }
      const articleTitle = firstResult['title'];
      callback(articleTitle);
    },
    error: (xhr, status, error) => {
      // TODO: error
    },
  });
}

function searchInterwikiLinks(articleTitle, fromLang, toLang) {
  console.log('Searching iwlinks for ' + articleTitle);
  const url = `https://${fromLang}.wikipedia.org/w/api.php`;
  const args = {
    format: 'json',
    action: 'query',
    prop: 'langlinks',
    lllimit: 500,
    titles: articleTitle,
  };
  const toLangArray = toLang.split(',');
  $.ajax({
    url: url,
    data: args,
    dataType: 'jsonp',
    success: (data) => {
      console.log(data);
      const pages = data['query']['pages'];
      const firstKey = Object.keys(pages)[0];
      const result = pages[firstKey];
      const linkArray = result['langlinks'];
      const resultArray = linkArray.filter((item) => {
        const lang = item['lang'];
        return toLangArray.indexOf(lang) !== -1;
      }).map((item) => {
        const title = item['*'];
        const lang = item['lang'];
        const encodedTitle = encodeURIComponent(title);
        const url = `https://${lang}.wikipedia.org/wiki/${encodedTitle}`;
        const resultString = `<p><a href=${url}>${title}</a></p>`;
        return resultString;
      });
      const outputString = resultArray.join('');
      $outputResult.html(outputString);
    },
    error: (xhr, status, error) => {
      console.log(error);
      // TODO: error
    },
  });
}

function main() {
  const data = gatherData();
  searchWikiArticle(data.query, data.fromLang, (articleTitle) => {
    searchInterwikiLinks(articleTitle, data.fromLang, data.toLang);
  });
}

$buttonSubmit.bind('touchstart click', main);

$(document).keypress((e) => {
  if (e.which === 13) {
    main();
  }
});
