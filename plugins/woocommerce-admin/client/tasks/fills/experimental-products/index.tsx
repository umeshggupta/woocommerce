/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import interpolateComponents from '@automattic/interpolate-components';
import { WooOnboardingTask } from '@woocommerce/onboarding';
import { Text } from '@woocommerce/experimental';
import { registerPlugin } from '@wordpress/plugins';
import { useMemo, useState } from '@wordpress/element';
import { Button, ExternalLink } from '@wordpress/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import { Link } from '@woocommerce/components';
import { getAdminLink } from '@woocommerce/settings';
/**
 * Internal dependencies
 */
import './index.scss';
import { getAdminSetting } from '~/utils/admin-settings';
import Stack from './stack';
import { getSurfacedProductKeys, getProductTypes } from './utils';
import useCreateProductByType from './use-create-product-by-type';

const onboardingData = getAdminSetting( 'onboarding' );
const onboardingProductTypes =
	( onboardingData?.profile && onboardingData?.profile.product_types ) || [];

const Products = () => {
	const [ isCollapsed, setIsCollapsed ] = useState< boolean >( true );
	const { createProductByType } = useCreateProductByType();

	const productTypes = useMemo(
		() =>
			getProductTypes().map( ( p ) => ( {
				...p,
				onClick: () => createProductByType( p.key ),
			} ) ),
		[ createProductByType ]
	);

	const surfacedProductKeys = getSurfacedProductKeys(
		onboardingProductTypes
	);

	const isAllProductSurfaced =
		surfacedProductKeys.length === productTypes.length;

	const visibleProductTypes = useMemo( () => {
		if ( isAllProductSurfaced ) {
			return productTypes;
		}

		const surfacedProductTypes = productTypes.filter( ( p ) =>
			surfacedProductKeys.includes( p.key )
		);
		if ( ! isCollapsed ) {
			// To show product types in same order, we need to push the other product types to the end.
			productTypes.forEach(
				( p ) =>
					! surfacedProductTypes.includes( p ) &&
					surfacedProductTypes.push( p )
			);
		}
		return surfacedProductTypes;
	}, [
		surfacedProductKeys,
		isCollapsed,
		isAllProductSurfaced,
		productTypes,
	] );

	return (
		<div className="woocommerce-task-products">
			<Text
				variant="title"
				as="h2"
				className="woocommerce-task-products__title"
			>
				{ __( 'What product do you want to add?', 'woocommerce' ) }
			</Text>

			<Stack items={ visibleProductTypes } />

			{ ! isAllProductSurfaced && (
				<Button
					className="woocommerce-task-products__button-view-less-product-types"
					onClick={ () => setIsCollapsed( ! isCollapsed ) }
				>
					{ __( 'View less product types', 'woocommerce' ) }
					<Icon icon={ isCollapsed ? chevronDown : chevronUp } />
				</Button>
			) }

			<div className="woocommerce-products-footer">
				<Text className="woocommerce-products-footer__selling-somewhere-else">
					Are you already selling somewhere else?
				</Text>
				<Text className="woocommerce-products-footer__import-options">
					{ interpolateComponents( {
						mixedString: __(
							'{{importCSVLink}}Import your products from a CSV file{{/importCSVLink}} or {{_3rdLink}}use a 3rd party migration plugin{{/_3rdLink}}.'
						),
						components: {
							importCSVLink: (
								<Link
									onClick={ () => {
										window.location = getAdminLink(
											'edit.php?post_type=product&page=product_importer&wc_onboarding_active_task=products'
										);
										return false;
									} }
									href=""
									type="wc-admin"
								>
									<></>
								</Link>
							),
							_3rdLink: (
								<ExternalLink
									href="https://woocommerce.com/products/cart2cart/?utm_medium=product"
									type="external"
								>
									<></>
								</ExternalLink>
							),
						},
					} ) }
				</Text>
			</div>
		</div>
	);
};

registerPlugin( 'wc-admin-onboarding-task-products', {
	// @ts-expect-error 'scope' does exist. @types/wordpress__plugins is outdated.
	scope: 'woocommerce-tasks',
	render: () => (
		// @ts-expect-error WooOnboardingTask is a pure JS component.
		<WooOnboardingTask id="products">
			<Products />
		</WooOnboardingTask>
	),
} );