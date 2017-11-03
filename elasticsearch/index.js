//example
// var doc = {
//   'item': {
//     'id': 6,
//     'upc': 'B00JRD13T8',
//     'category_id': 900,
//     'category_name': 'Electronics/Headphones/Earbud Headphones/Sony Extra Bass Earbud Headset',
//     'description': 'TopOne Sony MDR XB50AP B Extra Bass Earbud Headset',
//     'updated_at': '10042017 15:10',
//     'transaction_type': 'new item',
//     'images': [ 'https://images.a-clone.com/images/image1.jpg', 'https://images.a-clone.com/images/image2.jpg'],
//     'sellers': [ 
//       {'id': 1, 
//         'name': 'best deals 2015', 
//         'quantity': 5
//       }, 
//       {'id': 2, 
//         'name': '1 SHOP DIRECT', 'quantity': 2
//       }]
//   }
// };

const itemIndex = 'item';
const itemType = 'item';

var elasticsearch = require('elasticsearch');
var eslogin = process.env.ESLOGIN || 'elastic';
var espassword = process.env.ESPASSWORD || 'changeme';
var eshost = process.env.ESHOST || 'localhost:9200';

var esclient = new elasticsearch.Client({
  host: `${eslogin}:${espassword}@${eshost}`
});

var searchById = (id) => {
  return esclient.search({
    index: itemIndex,
    body: {
      query: {
        match: { _id: id}
      }
    }
  });
};

var seachFullText = (query) => {

  return esclient.search({
    index: itemIndex,
    body: {'query':
      {'match':
        {'description':
          {'query': query,
            'minimum_should_match': '50%'
          }
        }
      }
    }
  });
};

var createOrUpdate = (doc) => {
  var itemId = doc.item.id;
  return searchById(itemId)
    .then((result) => {
      if (result.hits.hits.length === 0) {
        return esclient.create({
          index: itemIndex,
          type: itemType,
          id: doc.item.id,
          body: doc.item
        });
      } else {
        return esclient.update({
          index: itemIndex,
          type: itemType,
          id: doc.item.id,
          body: {doc: doc.item}
        });
      }
    });
};

// createOrUpdate(doc)
//   .then((result) => {
//     console.log('Elasticsearch: createOrUpdate success', result);
//   })
//   .catch((error) => {
//     console.error('Elasticsearch: createOrUpdate error:', error);
//   });

// seachFullText('Headset')
//   .then((result) => {
//     console.log(result);
//   });


