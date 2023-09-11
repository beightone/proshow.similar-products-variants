import React from 'react'
import type { ProductTypes } from 'vtex.product-context'
import { useProduct } from 'vtex.product-context'
import { useQuery } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'
import { Link } from 'vtex.render-runtime'
import { useIntl } from 'react-intl'

import productRecommendationsQuery from './queries/productRecommendations.gql'
import SelectedItem from './components/SelectedItem'

interface SimilarProductsVariantsProps {
  productQuery: {
    product: {
      productId: string
    }
  }
  imageLabel: string
  textLabel: {
    specificationGroupName: string
    specificationName: string
  }
}
interface Item {
  sellers?: Seller[]
}

interface Seller {
  commertialOffer: CommercialOffer
}
interface CommercialOffer {
  AvailableQuantity: number
}

const CSS_HANDLES = [
  'variants',
  'title',
  'var-wrap',
  'img_wrap',
  'text_wrap',
  'img',
  'textLabel',
  'unavailable',
] as const

function SimilarProductsVariants({
  productQuery,
  textLabel,
}: SimilarProductsVariantsProps) {
  const handles = useCssHandles(CSS_HANDLES)
  const intl = useIntl()
  const productContext = useProduct()
  const productId =
    productQuery?.product?.productId ?? productContext?.product?.productId

  const { data, loading, error } = useQuery(productRecommendationsQuery, {
    variables: {
      identifier: { field: 'id', value: productId },
      type: `similars`,
    },
    skip: !productId,
  })

  if (loading || error) return null

  const { productRecommendations } = data

  const { products } = {
    products: productRecommendations || [],
  }

  const unique = [
    ...new Set<string>(
      products.map((item: ProductTypes.Product) => item.productId)
    ),
  ]

  const items: ProductTypes.Product[] = []

  unique.forEach(id => {
    const item = products.find(
      (element: ProductTypes.Product) => element.productId === id
    )

    if (item) items.push(item)
  })

  if (items.length === 0) {
    return <></>
  }

  return (
    <div className={`${handles.variants}`}>
      <p className={`${handles.title}`}>
        {intl.formatMessage({ id: 'store/title.label' })}
      </p>
      <div className={handles['var-wrap']}>
        <SelectedItem />
        {items.map((element: ProductTypes.Product & Item) => {
          // Labels
          let indexSpecificationGroup = -1
          let indexSpecification = -1

          if (
            element.specificationGroups.length >= 0 &&
            element.specificationGroups.find(
              group => group.name === textLabel?.specificationGroupName
            )
          ) {
            indexSpecificationGroup = element.specificationGroups.findIndex(
              group => group.name === textLabel?.specificationGroupName
            )
            if (
              indexSpecificationGroup !== -1 &&
              element.specificationGroups[
                indexSpecificationGroup
              ].specifications.find(
                specification =>
                  specification.name === textLabel?.specificationName
              )
            ) {
              indexSpecification = element.specificationGroups[
                indexSpecificationGroup
              ].specifications.findIndex(
                specification =>
                  specification.name === textLabel?.specificationName
              )
            }
          }

          let isAvailable = false

          if (element) {
            isAvailable =
              element.items[0].sellers[0].commertialOffer.AvailableQuantity > 0
          }

          return (
            <Link
              key={element.productId}
              className={`${handles.img_wrap} ${
                isAvailable ? '' : handles.unavailable
              }`}
              {...{
                page: 'store.product',
                params: {
                  slug: element?.linkText,
                  id: element?.productId,
                },
              }}
            >
              <span className={`${handles.text_wrap}`}>
                {indexSpecificationGroup > -1 && indexSpecification > -1 && (
                  <span className={`${handles.textLabel}`}>
                    {
                      element.specificationGroups[indexSpecificationGroup]
                        .specifications[indexSpecification].values[0]
                    }
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

SimilarProductsVariants.schema = {
  title: 'SimilarProducts Variants',
  description: 'SimilarProducts Variants',
  type: 'object',
  properties: {},
}

export default SimilarProductsVariants
