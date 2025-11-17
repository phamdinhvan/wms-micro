import {WmsProvider} from '@wms/core';
import {Board} from '../src/Board';
const App = () => {
  return (
    <WmsProvider>
      <div className="wms-h-screen wms-p-4">
        <Board />
      </div>
    </WmsProvider>
  );
};

export default App;
