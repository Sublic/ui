import { useBucketApprove } from "@/hooks/useBucketApprove";
import { LoadingOutlined } from "@ant-design/icons";
import { App, Button, ButtonProps } from "antd";
import { useEffect } from "react";
import { useTargetChain } from "@/hooks/useTargetChain";
import { bscTestnet } from "viem/chains";

export function BnbSubmitButton(btnProps: ButtonProps) {
  const {
    isConnected,
    isRoleGranted,
    roleIsLoading,
    roleIsSuccess,
    grantRole,
    grantRoleIsPending,
    grantRoleIsSuccess,
    grantRoleError,
  } = useBucketApprove();

  const [isAppropriateChain, switchChain] = useTargetChain(bscTestnet.id);

  const { notification } = App.useApp();

  useEffect(() => {
    if (grantRoleError) {
      notification.error({
        message: "Grant role tx error",
        description: String(grantRoleError),
      });
    }
  }, [grantRoleError]);

  useEffect(() => {
    if (grantRoleIsSuccess) {
      notification.success({
        message: "Grant role tx success",
      });
    }
  }, [grantRoleIsSuccess]);

  if (!isConnected) {
    return (
      <Button {...btnProps} disabled>
        Connect a wallet
      </Button>
    );
  }

  if (!isAppropriateChain) {
    return (
      <Button {...btnProps} htmlType="button" onClick={() => switchChain()}>
        Switch to BNB
      </Button>
    );
  }

  if (roleIsLoading) {
    return (
      <Button {...btnProps} htmlType="button" disabled>
        Checking permissions <LoadingOutlined />
      </Button>
    );
  }

  if (roleIsSuccess && !isRoleGranted) {
    return (
      <Button
        {...btnProps}
        htmlType="button"
        onClick={() => grantRole()}
        disabled={!isConnected}
      >
        Grant access
      </Button>
    );
  }

  if (grantRoleIsPending) {
    return (
      <Button {...btnProps} htmlType="button" disabled>
        Grant in progress <LoadingOutlined />
      </Button>
    );
  }

  return <Button {...btnProps} />;
}
