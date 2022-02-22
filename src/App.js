import { useQuery } from '@apollo/client'
import { SEARCH_REPOSITORIES } from './graphql'
import { useState } from 'react'

const PRE_PAGE = 5
const VARIABLES = {
  first: PRE_PAGE,
  after: null,
  last: null,
  before: null,
  query: 'フロントエンドエンジニア',
}

const SearchForm = ({ value, onChange }) => {
  return (
    <form onSubmit={(ev) => ev.preventDefault()}>
      <input value={value} onChange={(ev) => onChange(ev.currentTarget.value)} />
    </form>
  )
}

const Content = ({ variables, updatePaginationToNext }) => {
  const { after, before, first, last, query } = variables
  const { loading, error, data } = useQuery(SEARCH_REPOSITORIES, {
    variables: { after, before, first, last, query },
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :( {error.message}</p>

  console.log(data.search)

  const { edges, pageInfo } = data.search

  return (
    <>
      <Title data={data} />
      <ul>
        {edges.map((edge) => {
          return <RepositoryRow edge={edge} key={edge.node.id} />
        })}
      </ul>

      {pageInfo.hasNextPage && (
        <button type={'button'} onClick={updatePaginationToNext.bind(this, pageInfo)}>
          Next
        </button>
      )}
    </>
  )
}

const RepositoryRow = ({ edge }) => {
  const { node } = edge

  return (
    <li>
      <a href={node.url} target={'_blank'} rel={'noopener'}>
        {node.name}
      </a>
    </li>
  )
}

const Title = ({ data }) => {
  const { repositoryCount } = data.search
  const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories'
  const title = `GitHub Repositories Search Results - ${repositoryCount} ${repositoryUnit}`

  return <h2>{title}</h2>
}

function useVariables(defaultVariables) {
  const [variables, setVariables] = useState(VARIABLES)

  function updateQuery(query) {
    setVariables({ ...variables, query })
  }

  function updatePaginationToNext(pageInfo) {
    setVariables({
      ...variables,
      first: PRE_PAGE,
      after: pageInfo.endCursor,
      lest: null,
      before: null,
    })
  }

  return {
    variables,
    updateQuery,
    updatePaginationToNext,
  }
}

function App() {
  const { variables, updateQuery, updatePaginationToNext } = useVariables(VARIABLES)

  return (
    <div>
      <SearchForm value={variables.query} onChange={updateQuery} />
      <Content variables={variables} updatePaginationToNext={updatePaginationToNext} />
    </div>
  )
}

export default App
