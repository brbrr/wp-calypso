/** @format */
/**
 * External dependencies
 */
import {
	concat,
	flow,
	get,
	has,
	head,
	includes,
	overEvery,
	partial,
	partialRight,
	reduce,
	split,
} from 'lodash';

/**
 * Module constants
 */
export const ACTIVITY_REQUIRED_PROPS = [ 'activity_id', 'name', 'published', 'summary' ];
export const ACTIVITY_WHITELIST = [ 'post__updated' ];

export const DEFAULT_GRAVATAR_URL = 'https://www.gravatar.com/avatar/0';
export const DEFAULT_GRIDICON = 'info-outline';

/**
 * Transforms API response into array of activities
 *
 * @param  {object} _ API   response body
 * @param  {array}  _.items Array of item objects
 * @return {array}          Array of proccessed item objects
 */
export default function fromApi( { orderedItems = [] } ) {
	return reduce( orderedItems, itemsReducer, [] );
}

/**
 * Takes an Activity item in the API format returns true if it appears valid, otherwise false
 *
 * @param  {object}  item Activity item
 * @return {boolean}      True if the item appears to be valid, otherwise false.
 */
export const validateItem = overEvery( [
	partialRight( has, 'activity_id' ),
	partialRight( has, 'published' ),
	partialRight( has, 'summary' ),
	flow( partialRight( get, 'name', null ), partial( includes, ACTIVITY_WHITELIST ) ),
] );

/**
 * Reducer which recieves an array of processed items and an item to process and returns a new array
 * with the processed item appended if it is valid.
 *
 * @param  {array}  validProcessedItems Array of processed items
 * @param  {object} item                API format item to process
 * @return {array}                      Array of items with current item appended if valid
 */
export function itemsReducer( validProcessedItems, item ) {
	if ( ! validateItem( item ) ) {
		return validProcessedItems;
	}

	return concat( validProcessedItems, processItem( item ) );
}

/**
 * Takes an Activity item in the API format and returns a processed Activity item for use in UI
 *
 * @param  {object}  item Validated Activity item
 * @return {object}       Processed Activity item ready for use in UI
 */
export function processItem( item ) {
	return {
		...processItemBase( item ),
	};
}

export function processItemActor( item ) {
	return {
		actorAvatarUrl: get( item, [ 'actor', 'icon', 'url' ], DEFAULT_GRAVATAR_URL ),
		actorName: get( item, [ 'actor', 'name' ], DEFAULT_GRAVATAR_URL ),
		actorRemoteId: get( item, [ 'actor', 'external_user_id' ], DEFAULT_GRAVATAR_URL ),
		actorRole: get( item, [ 'actor', 'role' ], DEFAULT_GRAVATAR_URL ),
		actorWpcomId: get( item, [ 'actor', 'wpcom_user_id' ], DEFAULT_GRAVATAR_URL ),
	};
}

export function processItemBase( item ) {
	const published = get( item, 'published' );
	return {
		...processItemActor( item ),
		activityDate: published,
		activityGroup: head( split( get( item, 'name' ), '__', 1 ) ),
		activityIcon: get( item, 'gridicon', DEFAULT_GRIDICON ),
		activityId: get( item, 'activity_id' ),
		activityName: get( item, 'name' ),
		activityTitle: get( item, 'summary', '' ),
		activityTs: Date.parse( published ),
	};
}
