# [gurgen.zip](https://gurgen.zip)

My Personal Static Website Generator.

![Screenshot](https://github.com/rasjonell/www/blob/main/www.png)

Everything except `index.html` is generated using the `md-converterd.js` script.

The script:
- Reads the `./articles` directory
- Creteas a separate `/blog/{ slug }.html` file for each article
- Updates `/blog.html` with the 10 latest articles.
- Updates the RSS Feed `/rss.xml` with the 10 latest articles.

To run the generator:

- Clone the repository `git clone https://github.com/rasjonell/www.git`
- Install dev deps `cd www && npm i`
- Run the generator `npm run build`

Live Server: `npm run serve`
