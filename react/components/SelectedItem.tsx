import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useProduct } from 'vtex.product-context'
import { Link } from 'vtex.render-runtime'

const CSS_HANDLES = [
  'img_wrap',
  'text_wrap',
  'textLabel',
  'selectedItem',
] as const

const SelectedItem = () => {
  const handles = useCssHandles(CSS_HANDLES)
  const productContext = useProduct()
  const { linkText, productId, properties } = productContext?.product ?? {}

  return (
    <Link
      className={`${handles.img_wrap} ${handles.selectedItem}`}
      {...{
        page: 'store.product',
        params: {
          slug: linkText,
          id: productId,
        },
      }}
    >
      <span className={`${handles.text_wrap}`}>
        <span className={`${handles.textLabel}`}>
          {properties?.find(property => property.name === 'Cor')?.values[0]}
        </span>
      </span>
    </Link>
  )
}

export default SelectedItem
