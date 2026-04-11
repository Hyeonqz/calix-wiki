import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = {
  title: 'Calix Wiki',
  description: 'Personal knowledge wiki maintained by LLM'
}

export default async function RootLayout({ children }) {
  return (
    <html lang="ko" dir="ltr" data-theme="light" suppressHydrationWarning>
      <Head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Layout
          navbar={
            <Navbar
              logo={<span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Calix Wiki</span>}
              projectLink="https://github.com/Hyeonqz/calix-wiki"
            />
          }
          footer={<Footer>MIT {new Date().getFullYear()} © Calix</Footer>}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Hyeonqz/calix-wiki/tree/main/wiki"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          toc={{ float: true }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
