import MDXComponents from '@theme-original/MDXComponents';
import OefeningAssistent from '@site/src/components/OefeningAssistent';

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
};
