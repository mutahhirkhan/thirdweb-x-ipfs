import { useState, useRef } from 'react'
import './App.css'
import { useStorageUpload, useContract, useContractWrite, ConnectWallet, useAddress, useConnectionStatus } from '@thirdweb-dev/react'
import { CONTRACT_ADDRESS } from './utils/common'
import { MyTokenABI } from './utils/abi.json'

function App() {
  const imgSrcRef = useRef()
  const [nftState, setNftState] = useState({
    name: '',
    description: '',
    image: null,
  })
  const { mutateAsync: upload, isLoading: isUploading, isError: isUploadError, error: uploadError } = useStorageUpload({})
  const { data: contract } = useContract(CONTRACT_ADDRESS, MyTokenABI)
  const { mutateAsync, isLoading, error, data, isSuccess, isError } = useContractWrite(contract, 'safeMint')
  const address = useAddress()
  const isConnected = useConnectionStatus() === 'connected'

  const uploadViathirdweb = async payload => {
    const result = await upload({
      data: payload,
      options: {
        uploadWithGatewayUrl: true,
        uploadWithoutDirectory: true,
      },
    })
    return result
  }

  const simpleURI = hash => 'ipfs://' + hash[0].split('/ipfs/')[1] // ipfs://<hash>

  const onSubmit = async () => {
    try {
      const imageHash = await uploadViathirdweb([nftState.image]) //payload must be an array
      //URI Metadata object
      const metadataHash = await uploadViathirdweb([
        {
          ...nftState,
          image: 'https://ipfs.io/ipfs/' + imageHash[0].split('/ipfs/')[1], // public IPFS gateway,
        },
      ])

      //safeMint function with two arguments:
      // 1. address
      // 2. metadata URI including tokenURI
      mutateAsync({ args: [address, simpleURI(metadataHash)] })
    } catch (error) {
      console.error('ERROR', error)
    }
  }

  const setNftStateValues = e => {
    e.target.files && (imgSrcRef.current = URL.createObjectURL(e.target.files?.[0]))
    setNftState({ ...nftState, [e.target.name]: e.target.files?.[0] ?? e.target.value })
  }

  return (
    <>
      <div>Hi! how are? 🙂</div>
      <ConnectWallet />
      {isConnected ? (
        <div>
          {isLoading || isUploading ? (
            <div>Uploading...</div>
          ) : (
            <form
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              onSubmit={e => {
                e.preventDefault()
                onSubmit()
              }}
            >
              <input required type="file" id="img" name="image" onChange={setNftStateValues} accept=".png" />
              <input required type="text" name="name" onChange={setNftStateValues} id="" placeholder={'Title'} />
              <input required type="text" name="description" onChange={setNftStateValues} id="" placeholder={'Description'} />
              <button type="submit">Upload</button>
              <img ref={imgSrcRef} width={500} src={imgSrcRef.current} alt="image preview" />
            </form>
          )}
        </div>
      ) : (
        <div>Not Connected</div>
      )}

      {isError || (isUploadError && <div>Error: {error?.message || uploadError?.message}</div>)}
      {isSuccess && (
        <div>
          <a href={`http://mumbai.polygonscan.com/tx/${data?.receipt.transactionHash}`}>View on explorer</a> <br />
          <a href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${Number(data?.receipt?.events?.[0].args?.tokenId)}`}>
            View on opensea
          </a>
        </div>
      )}
    </>
  )
}

export default App
