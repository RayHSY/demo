import Head from 'next/head'
import Upload from '../components/Upload/index';
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Upload chunkSize={1024 * 1024} multiple={true} />
      </main>
    </div>
  )
}
