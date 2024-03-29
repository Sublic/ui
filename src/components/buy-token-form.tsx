import { useAccount } from "@/hooks/useAccount";
import { useApproveToken } from "@/hooks/useApproveToken";
import { useBuySubscriptionToken } from "@/hooks/useBuySubscriptionToken";
import { useMediaTokenAddress } from "@/hooks/useMediaTokenAddress";
import { useTargetChain } from "@/hooks/useTargetChain";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";
import {
  App,
  Button,
  Form,
  InputNumber,
  Skeleton,
  Spin,
  Typography,
} from "antd";
import BigNumber from "bignumber.js";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { bscTestnet } from "viem/chains";

interface BuyTokenFormProps {
  mediaId: `0x${string}`;
}

export function BuyTokenForm({ mediaId }: BuyTokenFormProps) {
  const [amountToBuy, setAmountToBuy] = useState(BigNumber(0));

  const { tokenAddress, isLoading } = useMediaTokenAddress(mediaId);
  const { address } = useAccount();
  const [isTargetChainSelected, switchChain] = useTargetChain(bscTestnet.id);

  const {
    value,
    usdcAddress,
    decimals,
    isLoading: isUsdcLoading,
    allowance,
  } = useUSDCBalance(address);

  const { buy: writeBuy, ...buyStatus } = useBuySubscriptionToken(mediaId);

  const { approve: writeApprove, ...approveStatus } =
    useApproveToken(usdcAddress);

  const { notification } = App.useApp();

  const printableAmount =
    (value || BigInt(0)) / BigInt(Math.pow(10, decimals || 6));

  const amountToBuyIsCorrect =
    value != null &&
    BigNumber(value.toString()).gte(amountToBuy) &&
    amountToBuy.gt(0);

  const isApproveRequired = BigNumber(allowance?.toString() || 0).lte(
    amountToBuy
  );

  useEffect(() => {
    if (buyStatus.isError) {
      notification.error({
        message: "Buy tx failed",
        description: buyStatus.error ? String(buyStatus.error) : undefined,
      });
    }
  }, [notification, buyStatus.isError, buyStatus.error]);

  useEffect(() => {
    if (approveStatus.isError) {
      notification.error({
        message: "Approve tx failed",
        description: approveStatus.error
          ? String(approveStatus.error)
          : undefined,
      });
    }
  }, [notification, approveStatus.isError, approveStatus.error]);

  const buy = () => {
    writeBuy(amountToBuy.multipliedBy(BigNumber(10).pow(decimals || 6)));
    setAmountToBuy(BigNumber(0));
  };

  const BuyButton = (
    <Button
      type="primary"
      onClick={buy}
      disabled={
        buyStatus.isPending || buyStatus.isSuccess || !amountToBuyIsCorrect
      }
    >
      {buyStatus.isPending ? <Spin /> : "Buy"}
    </Button>
  );

  const approve = () => {
    writeApprove(amountToBuy.multipliedBy(BigNumber(10).pow(decimals || 6)));
  };

  const ApproveButton = (
    <Button
      type="primary"
      onClick={approve}
      disabled={approveStatus.isPending || !amountToBuyIsCorrect}
    >
      {approveStatus.isPending ? <Spin /> : "Approve"}
    </Button>
  );

  const SwitchButton = (
    <Button type="primary" onClick={switchChain}>
      Switch to BNB chain
    </Button>
  );

  if (tokenAddress === zeroAddress) {
    notFound();
  }

  return (
    <Form layout="vertical">
      <Form.Item label="USDC amount to buy">
        <InputNumber
          value={amountToBuy.toString()}
          onChange={(e) => setAmountToBuy(BigNumber(e || 0))}
          suffix="USDC"
          className="min-w-[200px]"
        />
      </Form.Item>
      <Form.Item label="You have">
        {isUsdcLoading ? (
          <Skeleton.Input />
        ) : (
          <Typography.Text strong>
            {printableAmount.toString()} USDC
          </Typography.Text>
        )}
      </Form.Item>
      <Form.Item>
        {isTargetChainSelected
          ? isApproveRequired
            ? ApproveButton
            : BuyButton
          : SwitchButton}
      </Form.Item>
    </Form>
  );
}
