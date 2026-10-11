import { registerRoot, Composition } from 'remotion';
import { Ad, FPS, DURATION } from './Ad';
import '@fontsource/amiri/700.css';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/playfair-display/700-italic.css';
import '@fontsource/montserrat/500.css';

const Root = () => (
  <>
    <Composition id="Ad" component={Ad} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ layers: 'all' }} />
    <Composition id="Overlay" component={Ad} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ layers: 'overlay' }} />
  </>
);
registerRoot(Root);
