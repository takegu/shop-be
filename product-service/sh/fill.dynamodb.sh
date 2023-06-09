#!/bin/sh

_jq() {
  echo "${row}" | base64 --decode | jq -r "${1}"
}

# read the devices.json file and store it in the variable jsonlist
jsonlist=$(jq -r '.products' "./mocks/product.mock.json")

  for row in $(echo "${jsonlist}" | jq -r '.[] | @base64'); do
    echo "product_id: $(_jq '.product_id')" \
      "description: $(_jq '.description')" \
      "price: $(_jq '.price')" \
      "title: $(_jq '.title')"

    aws dynamodb put-item \
      --table-name products_table \
      --item "{\"product_id\": {\"S\": \"$(_jq '.product_id')\"},
      \"description\": {\"S\": \"$(_jq '.description')\"},
      \"price\": {\"N\": \"$(_jq '.price')\"},
      \"title\": {\"S\": \"$(_jq '.title')\"}}" \
      --profile aws-rs
  done

jsonlist=$(jq -r '.stock' "./mocks/stock.mock.json")

  for row in $(echo "${jsonlist}" | jq -r '.[] | @base64'); do
    echo "product_id: $(_jq '.product_id')" \
      "count: $(_jq '.count')"

    aws dynamodb put-item \
      --table-name stock_table \
      --item "{\"product_id\": {\"S\": \"$(_jq '.product_id')\"}, \"count\": {\"N\": \"$(_jq '.count')\"}}" \
      --profile aws-rs
  done
