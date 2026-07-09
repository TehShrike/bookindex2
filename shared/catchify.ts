export default <T>(promise: Promise<T>): Promise<[ null, T ] | [ Error, null ]> => promise.then(
	(result): [ null, T ] => [ null, result ],
).catch(
	(err: Error): [ Error, null ] => [ err, null ],
)
