# Suomen talousvahti

Julkisen Suomen talouden mittariston ensimmäinen verkkoversio. Sovellus on Next.js-pohjainen, toimii mobiilissa ja työpöydällä, ja sen voi julkaista esimerkiksi Vercelissä.

## Mitä tässä versiossa on

- Suomen talousmittariston etusivu ja luokittelu.
- Mittarien valinta ja järjestyksen hallinta selaimessa.
- Mittarikohtaiset lähteet, viiteajankohdat ja datan tilamerkinnät.
- Historiakuvaajien rakenne: kuvaaja näkyy vasta, kun oikeaa aikasarjadataa on kytketty.
- Erottelu toteutuneiden havaintojen, ennusteiden ja budjettilukujen välillä.
- Ei keksittyjä reaaliaikaisia arvoja tai tekaistuja historiapisteitä.

## Tärkeä tietotilanne

Tämä on julkaisuvalmis **käyttöliittymän ja sovellusrungon ensimmäinen versio**, ei vielä valmis automaattinen tietopalvelu. Käyttäjän antamat luvut näkyvät lähtötietoina, joiden alkuperä ja ajankohta on merkitty. Niitä ei ole varmennettu uudelleen virallisista rajapinnoista tässä projektissa, eikä sovellus väitä niiden olevan reaaliaikaisia.

Automaattiset tiedot pitää liittää mittarikohtaisesti. Tilastokeskuksen PxWeb-rajapinnan taulukkotunnisteet ja muuttujakoodit muuttuivat kesäkuussa 2026, joten vanhoja API-kyselyitä ei pidä kopioida sellaisenaan. Ohje: https://stat.fi/en/services/statistical-data-services/open-data-and-interfaces/interface-use-of-databases/instructions-for-updating-interface-queries

## Paikallinen käynnistys

Tarvitset Node.js 20.9 tai uudemman.

```bash
npm install
npm run dev
```

Avaa selaimessa http://localhost:3000

Tarkista tuotantoversio:

```bash
npm run build
npm start
```

## Julkaisu maksuttomaan verkko-osoitteeseen

1. Luo GitHub-tili, jos sinulla ei vielä ole sellaista.
2. Luo uusi GitHub-repositorio ja lataa tämän projektin tiedostot siihen.
3. Avaa https://vercel.com/ ja kirjaudu sisään GitHubilla.
4. Valitse **Add New → Project** ja tuo repositorio.
5. Vercel tunnistaa Next.js-projektin automaattisesti. Valitse Deploy.
6. Saat julkisen `*.vercel.app`-osoitteen.

Vercelin ajantasaiset Next.js-ohjeet: https://vercel.com/docs/frameworks/full-stack/nextjs

## Tietojen automaattisen päivityksen toteutusjärjestys

1. Tilastokeskuksen PxWeb: BKT, työmarkkinat ja kuluttajahinnat.
2. Eurostat: julkisyhteisöjen velka, alijäämä ja vertailut EU-maihin.
3. Valtiokonttori ja Valtiovarainministeriö: lainanotto, budjetti ja ennusteet.
4. Markkinadatan tarjoaja: 10 vuoden valtionlainan korko ja Brent-öljy. Tarkista käyttöehdot, API-rajoitukset ja mahdolliset maksut.

Jokaisen liitännän tulee palauttaa arvon lisäksi vähintään:
- havaintojakso
- lähde-URL
- haun/päivityksen ajankohta
- tila (vahvistettu, vanhentunut tai puuttuva)
- tieto siitä, onko kyse toteumasta, ennusteesta vai budjettiesityksestä.

## Tietojen ylläpidon periaate

Älä korvaa puuttuvaa havaintoa arvauksella. Jos lähde ei vastaa, säilytä viimeinen tallennettu havainto ja merkitse se vanhentuneeksi. Ennusteet ja budjettiesitykset pidetään eri tietotyyppeinä kuin toteutuneet tilastot.
