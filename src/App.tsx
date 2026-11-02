import { h, Fragment } from './jsx';
import { content } from './content';
import { About } from './components/About';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';

export function App(): Node {
  return (
    <>
      <a class="skip-link" href="#main">Saltar al contenido</a>
      <Navbar brand={content.brand} links={content.nav} />
      <main id="main">
        <Hero data={content.hero} social={content.social} />
        <About data={content.about} />
        <Skills data={content.skills} />
        <Projects data={content.projects} />
        <CallToAction data={content.contact} />
      </main>
      <Footer brand={content.brand} {...content.footer} social={content.social} />
    </>
  );
}
