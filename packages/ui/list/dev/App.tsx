import {WmsProvider} from '@wms/core';
import {List} from '../src';

const App = () => {
  return (
    <WmsProvider>
      <List />
    </WmsProvider>
  );
};

export default App;
