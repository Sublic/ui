"use client";
import { Article, ArticleInfo } from "@/components/feed";
import { useQuery } from "@tanstack/react-query";
import { Row, Spin } from "antd";
import { downloadFile } from "@/client/greenfieldDownloadFile";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { GREEN_CHAIN_ID } from "@/config";
import { bscTestnet } from "viem/chains";
import { getBucketFromMediaId } from "@/client/getBucketFromMediaId";

function useArticle(
  mediaId: `0x${string}`,
  preview: string,
  address: `0x${string}` | undefined,
  walletClient: any,
  bscReadClient: any
) {
  const readClient = usePublicClient({ chainId: bscTestnet.id })!;
  return useQuery<Article, Error, Article, [string, string, string]>({
    queryKey: ["ARTICLE_LOAD", mediaId, preview],
    queryFn: async ({ queryKey }) => {
      const { bucketInfo } = await getBucketFromMediaId(mediaId, {
        readClient: bscReadClient,
      });
      if (!bucketInfo?.bucketName) {
        throw new Error("Failed to fetch bucket info");
      }
      if (!address) {
        throw new Error("Address is not provided");
      }
      const name_description = await downloadFile(
        `${queryKey[2]}/name_description.txt`,
        bucketInfo.bucketName,
        {
          user: address,
          viemClient: walletClient,
          window,
          readClient,
        }
      );
      const parts = name_description.split("\n----\n");
      const name = parts[0].trim();
      const description = parts[1].trim();
      const file = await downloadFile(
        `${queryKey[2]}/content.md`,
        bucketInfo.bucketName,
        {
          user: address,
          viemClient: walletClient,
          window,
          readClient,
        }
      );

      return {
        id: queryKey[2],
        description: description,
        name: name,
        text: file,
      };
    },
  });
}

export default function Page({
  params,
}: {
  params: { id: `0x${string}`; article: string };
}) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({
    chainId: GREEN_CHAIN_ID,
  });
  const bscReadClient = usePublicClient({
    chainId: bscTestnet.id,
  })!;
  const { isLoading, data } = useArticle(
    params.id,
    params.article,
    address,
    walletClient,
    bscReadClient
  );
  return (
    <Row justify="center" className="px-[10%]">
      {isLoading ? (
        <Spin tip="Loading..." className="mt-10">
          <div />
        </Spin>
      ) : (
        <ArticleInfo {...data!} />
      )}
    </Row>
  );
}
