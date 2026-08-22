import { LoadingScreen } from './components/LoadingScreen';
import { Home } from './components/Home';
import { FadeInWrapper } from './components/LoadingScreen/FadeInWrapper';

export default function Page() {
  return (
    <>
      <LoadingScreen />
      <FadeInWrapper>
        <Home />
      </FadeInWrapper>
    </>
  );
}