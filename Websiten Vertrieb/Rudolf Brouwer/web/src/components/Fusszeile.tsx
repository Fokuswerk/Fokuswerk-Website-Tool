import Link from "next/link";
import Image from "next/image";
import { betrieb } from "@/daten/betrieb";
import { leistungen } from "@/daten/leistungen";

export default function Fusszeile() {
  return (
    <footer className="fuss auf-dunkel">
      <div className="bahn">
        <div className="fuss-kopf">
          <div>
            <div className="fuss-marke">
              <Image src="/bilder/logo-hell.png" alt={betrieb.name} width={300} height={121} />
            </div>
            <p className="fuss-satz">
              Meisterbetrieb für Bad, Heizung und Energie. Seit {betrieb.gruendung} in Familienhand,
              seit {betrieb.adresseSeit} am Ortseingang von {betrieb.ort}.
            </p>
          </div>
          <div className="fuss-ruf">
            <a href={`tel:${betrieb.telefonRoh}`} className="fuss-nummer">{betrieb.telefon}</a>
            <a href={`mailto:${betrieb.mail}`} className="fuss-mail still">{betrieb.mail}</a>
          </div>
        </div>

        <div className="fuss-tafeln">
          <div className="fuss-tafel">
            <h3>Leistungen</h3>
            <ul>
              {leistungen.map((l) => (
                <li key={l.weg}><Link href={l.weg}>{l.marke}</Link></li>
              ))}
            </ul>
          </div>
          <div className="fuss-tafel">
            <h3>Betrieb</h3>
            <ul>
              <li><Link href="/ausstellung">Ausstellung</Link></li>
              <li><Link href="/unternehmen">Unternehmen</Link></li>
              <li><Link href="/karriere">Karriere</Link></li>
              <li><Link href="/karriere/ausbildung">Ausbildung</Link></li>
              <li><Link href="/kontakt">Kontakt</Link></li>
            </ul>
          </div>
          <div className="fuss-tafel">
            <h3>Anschrift</h3>
            <ul>
              <li>{betrieb.strasse}</li>
              <li>{betrieb.plz} {betrieb.ort}</li>
              <li className="fuss-abstand">Telefon {betrieb.telefon}</li>
              <li>Telefax {betrieb.fax}</li>
            </ul>
          </div>
          <div className="fuss-tafel">
            <h3>Öffnungszeiten</h3>
            <ul>
              {betrieb.zeiten.map((z) => (
                <li key={z.tage}>{z.tage}<br /><span className="still">{z.zeit}</span></li>
              ))}
              <li className="fuss-abstand"><Link href="/leistungen/kundendienst#notdienst">Heizungsnotdienst rund um die Uhr</Link></li>
            </ul>
          </div>
        </div>

        <div className="fuss-zeile">
          <span>© {new Date().getFullYear()} {betrieb.name}</span>
          <nav aria-label="Rechtliches">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
