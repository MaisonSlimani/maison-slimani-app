import { HomeData } from '@maison/domain'
import HomeClient from './HomeClient'

/**
 * Bridge component to handle the awaited data from the Page
 */
export default async function HomeClientSection({ dataPromise }: { dataPromise: Promise<HomeData> }) {
    const data = await dataPromise
    return <HomeClient initialData={data} />
}
