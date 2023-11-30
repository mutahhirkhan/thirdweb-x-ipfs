import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThirdwebProvider, metamaskWallet } from '@thirdweb-dev/react'

import { THIRD_WEB_CREDENTIALS } from './utils/common.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThirdwebProvider
    supportedWallets={[metamaskWallet()]}
    // supportedChains={[ChainId.Mumbai]}
    activeChain={'mumbai'}
    autoConnect={true}
    autoSwitch={true}
    {...THIRD_WEB_CREDENTIALS}
  >
    <App />
  </ThirdwebProvider>,
)
