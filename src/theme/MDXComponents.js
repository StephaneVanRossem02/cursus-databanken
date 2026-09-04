import MDXComponents from '@theme-original/MDXComponents';
import OefeningAssistent from '@site/src/components/OefeningAssistent';
import Voortgang from '@site/src/components/Voortgang';
import Modeloplossing from '@site/src/components/Modeloplossing';
import SqlSandbox from '@site/src/components/SqlSandbox';

/**
 * Globaal beschikbaar maken in MDX, zodat een oefeningpagina enkel
 *
 *   <OefeningAssistent oefening="L02-01" hoofdstuk="L2" />
 *
 * nodig heeft, zonder import bovenaan. "hoofdstuk" is hier het leerlijnniveau (L1..L6).
 */
export default {
  ...MDXComponents,
  OefeningAssistent,
  Voortgang,
  Modeloplossing,
  SqlSandbox,
};
