export type InitMediaRequest = {
  name: string;
  authors: Array<string>;
};

export type SublicGroup = {
  name: string;
  type: "authors" | "subscribers";
  id: number;
  mediaId: `0x${string}`;
  mediaName: string;
};
