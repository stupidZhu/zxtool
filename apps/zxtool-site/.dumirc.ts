import { IDumiUserConfig } from "dumi/dist/types"

const home = process.env.HOMEPAGE

const config: IDumiUserConfig = {
  themeConfig: {
    name: "ZXTool",
    logo: "https://s2.loli.net/2023/08/15/viFKg9krfsMJU2Y.png",
    socialLinks: {
      github: "https://github.com/stupidZhu/zxtool",
    },
    lastUpdated: false,
  },
  styles: ["//at.alicdn.com/t/font_2346762_78tfqsq57sm.css"],
  base: home,
  publicPath: home,
}

export default config
