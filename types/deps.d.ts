declare module 'cli-menu' {
	type MenuItemAction = (arg: { back: () => void }) => unknown

	type MenuItem = {
		key: string,
		name: string,
		action: MenuItemAction,
	}

	type MenuOptions = {
		title?: string,
		menu_items: MenuItem[],
		display_menu?: (arg: { title: string, menu_items: MenuItem[] }) => void,
	}

	const menu: (options: MenuOptions) => Promise<unknown>

	export default menu
}

declare module 'sql-concat' {
	type SqlValue = string | number | boolean | null | SqlValue[] | { [key: string]: SqlValue }

	type BuiltQuery = {
		sql: string,
		values: SqlValue[],
	}

	interface QueryBuilder {
		select(...args: unknown[]): QueryBuilder,
		from(...args: unknown[]): QueryBuilder,
		join(...args: unknown[]): QueryBuilder,
		leftJoin(...args: unknown[]): QueryBuilder,
		where(...args: unknown[]): QueryBuilder,
		whereLike(...args: unknown[]): QueryBuilder,
		orWhere(...args: unknown[]): QueryBuilder,
		orWhereLike(...args: unknown[]): QueryBuilder,
		having(...args: unknown[]): QueryBuilder,
		orHaving(...args: unknown[]): QueryBuilder,
		groupBy(...args: unknown[]): QueryBuilder,
		orderBy(...args: unknown[]): QueryBuilder,
		limit(...args: unknown[]): QueryBuilder,
		forUpdate(): QueryBuilder,
		lockInShareMode(): QueryBuilder,
		build(joinedBy?: string): BuiltQuery,
		getClauses(): Record<string, unknown>,
		toString(joinedBy?: string): string,
	}

	const q: QueryBuilder & ((strings: TemplateStringsArray, ...values: unknown[]) => QueryBuilder)

	export default q
}

declare module 'sql-tagged-template-literal' {
	const sql: (strings: TemplateStringsArray, ...values: unknown[]) => string

	export default sql
}
