import React, { useEffect, useState } from "react";
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNFTDrop,
} from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import { client, urlFor } from "../../sanity";
import { Collection } from "../../typings";
import { BigNumber } from "ethers";
import toast, { Toaster } from "react-hot-toast";
interface Props {
  collection: Collection;
}

function NFTDrop({ collection }: Props) {
  const [ClaimedSupply, setClaimedSupply] = useState<number>(0);
  const [Loading, setLoading] = useState<boolean>(false);
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [priceInEth, setPriceInEth] = useState<string>();
  const nftDrop = useNFTDrop(collection.address);

  const fetcNFTDropData = async () => {
    if (!nftDrop) return;
    setLoading(true);
    const claimed = await nftDrop?.getAllClaimed();
    const total = await nftDrop?.totalSupply();

    setClaimedSupply(claimed?.length);
    setTotalSupply(total);
    setLoading(false);
  };

  const fetchPrice = async () => {
    if (!nftDrop) return;

    const claimConditions = await nftDrop.claimConditions.getAll();

    setPriceInEth(claimConditions?.[0].currencyMetadata.displayValue);
  };

  const mintNft = () => {
    setLoading(true);

    const notification = toast.loading("Minting....", {
      style: {
        background: "white",
        color: "green",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });

    if (!nftDrop || !address) return;

    nftDrop
      ?.claimTo(address, 1)
      .then(async (tx) => {
        const receipt = tx[0].receipt; //the transaction receipt
        const claimedTokenId = tx[0].id; //the id of the claimed NFT
        const claimedNFT = await tx[0].data(); // (optional) get the metadata of the claimed NFT

        toast("Minting done Successfully", {
          duration: 8000,
          style: {
            background: "green",
            color: "white",
            fontWeight: "bolder",
            fontSize: "12px",
            padding: "20px",
          },
        });

        console.log(claimedTokenId);
        console.log(claimedNFT);
        console.log(receipt);
      })
      .catch((err) => {
        console.log(err);

        toast.error("Whoooops.... Something went wrong!", {
          style: {
            background: "red",
            color: "white",
            fontWeight: "bolder",
            fontSize: "17px", //1.5rem
            padding: "20px", //1rem}
          },
        });
      })
      .finally(() => {
        setLoading(false);

        toast.dismiss(notification);
      });
  };

  useEffect(() => {
    if (!nftDrop) return;

    fetcNFTDropData();
  }, [nftDrop]);

  useEffect(() => {
    if (!nftDrop) return;

    fetchPrice();
  }, [nftDrop]);
  const connectWithMetamask = useMetamask();

  const address = useAddress();

  const disconnect = useDisconnect();

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10 ">
      <Toaster></Toaster>
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
            <h1 className="text-6xl font-bold text-yellow-200">
              {collection.nftCollectionName}
            </h1>
            <h2 className="text-xl text-gray-300">{collection.description}</h2>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        {/* Header*/}

        <header className="flex items-center justify-between">
          <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
            {" "}
            The
            <span className="font-extrabold underline decoration-pink-600/50   ">
              Blazy
            </span>{" "}
            NFT Market Place
          </h1>
          <button
            onClick={() => (address ? disconnect() : connectWithMetamask())}
            className="rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white lg:px-5 lg:py-3 lg:text-base"
          >
            {address ? "Sign Out" : "Sign In"}
          </button>
        </header>

        <hr className="my-2 border" />

        {address && (
          <p className=" text-center text-rose-400">
            You are logged in with {address.substring(0, 5)}...{" "}
            {address.substring(address.length - 5)}
          </p>
        )}
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

          {Loading ? (
            <div className="pt-2 text-xl text-green-500">
              Loading Supply count ...{" "}
            </div>
          ) : (
            <p className="pt-2 text-xl text-green-500">
              {ClaimedSupply}/{totalSupply?.toString()} NFT have been claimed
            </p>
          )}

          {Loading && (
            <img
              className="h-80 w-80 object-contain items-center "
              src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
              alt=""
            ></img>
          )}
        </div>

        {/*Bottom */}

        <button
          onClick={mintNft}
          disabled={
            Loading || ClaimedSupply === totalSupply?.toNumber() || !address
          }
          className="h-16 font-bold bg-green-600 text-white rounded-full w-full disabled:bg-gray-400 mt-10"
        >
          {Loading ? (
            <>Loading...</>
          ) : ClaimedSupply === totalSupply?.toNumber() ? (
            <>Sold Out</>
          ) : !address ? (
            <>Sign in to Mint</>
          ) : (
            <span className="font-bold">Mint NFT ({priceInEth} ETH)</span>
          )}
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
  }`;

  const collection = await client.fetch(query, {
    id: params?.id,
  });

  if (!collection) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      collection,
    },
  };
};
