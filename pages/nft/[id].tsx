import React from "react";
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import { client, urlFor } from "../../sanity";
import { Collection } from "../../typings";

interface Props {
  collection: Collection
}


function NFTDrop({collection}:Props) {

  const connectWithMetamask = useMetamask(); 

  const address=useAddress()

  const disconnect=useDisconnect();


  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10 ">
      <div className="bg-gradient-to-br from-cyan-900 to-green-700 lg:col-span-4">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen ">
          <div className="bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl">
            <img
              src={urlFor(collection.previewImage).url()}
              alt=""
              className="w-44 rounded-xl object-cover hover:animate-rotate-y lg:h-96 lg:w-72"
            />  
          </div>
          <div className="text-center p-5 space-y-2">
            <h1 className="text-6xl font-bold text-yellow-200">{collection.nftCollectionName}</h1>
            <h2 className="text-xl text-gray-300">
              {collection.description}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        {/* Header*/}

        <header className="flex items-center justify-between">
          <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
            {" "}
            The
            <span className="font-extrabold underline decoration-pink-600/50   ">Blazy</span> NFT Market Place
          </h1>
          <button onClick={()=>(address?disconnect():connectWithMetamask())} className="rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white lg:px-5 lg:py-3 lg:text-base">
            {address?"Sign Out":"Sign In"}
          </button>
        </header>

        <hr className="my-2 border" />

        {address && (<p className=" text-center text-rose-400">You are logged in with {address.substring(0,5)}... {address.substring(address.length-5)}</p>)}
        {/*Middle */}

        <div className="mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center">
          <img
            src={urlFor(collection.mainImage).url()}
            className="w-80 object-cover pb-10 lg:h-40 "
            alt=""
          />
          <h1 className="font-bold text-3xl lg:font-extrabold ">
           {collection.title}
          </h1>
          <p className="pt-2 text-xl text-green-500">
            13/21 NFT have been claimed
          </p>
        </div>

        {/*Bottom */}

        <button className="h-16 font-bold bg-green-600 text-white rounded-full w-full">
          {" "}
          Mint NFT (0.1ETH)
        </button>
      </div>
    </div>
  );
}

export default NFTDrop;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `*[_type == "collection" && slug.current == $id][0]{
    _id,
    title,
    address,
    description,
    nftCollectionName,
    mainImage {
     asset
  },
  previewImage {
    asset
  },
  slug {
  current
  },
  creator -> {
    _id,
      name,
      address,
      slug {
        current
      },
  },
  }`

  const collection = await client.fetch(query, {
    id: params?.id,
  })

  if (!collection) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      collection,
    },
  }
}