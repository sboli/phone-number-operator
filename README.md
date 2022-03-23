# Presentation

This micro-api aims to provide operator information about a phone number. Only French numbers are supported.
Data is grabbed from the [data.gouv.fr dataset](https://www.data.gouv.fr/fr/datasets/ressources-en-numerotation-telephonique/)

# Usage

Query the api at `/:internationalPhoneNumber`

### Example response:

```json
{
  "name": "Digicel Antilles Françaises Guyane",
  "territory": "Guadeloupe",
  "abbreviation": "BUYC"
}
```

### Error codes:

| Error code | Description                        |
| :--------: | :--------------------------------- |
|    404     | No operator found for this number  |
|    400     | Invalid international phone number |

### Docker

Build the image with:

`docker build -t pno .`

Run the image:

`docker run -d -p 3000:3000 pno`

Query the api at `http://localhost:3000/XXXXXXXXXX`
