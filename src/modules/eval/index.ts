import type { GenericType } from '../connection/connection'
import type { DataMap } from '../consumer/buffer'
import * as acorn from 'acorn'

const identifierSolver = (value: DataMap | GenericType, property: string) => {
	if (typeof value === 'object') return (value as DataMap)[property]
	return value
}

const resolveStatement = (statement: acorn.Statement, options: ContextOptions) => {
	if (statement.type === 'ExpressionStatement') {
		const value = resolveExpressionStatement(statement, options)
		return identifierSolver(value as DataMap, options.property)
	}
}

const resolveExpression = (expression: acorn.Expression, options: ContextOptions) => {
	if (expression.type === 'Literal') {
		return resolveLiteral(expression)
	}
	if (expression.type === 'BinaryExpression') {
		return resolveBinaryExpression(expression, options)
	}
	if (expression.type === 'Identifier') {
		return resolveIdentifier(expression, options)
	}
	if (expression.type === 'MemberExpression') {
		return resolveMemberExpression(expression, options)
	}
}

const resolveExpressionStatement = (
	{ expression }: acorn.ExpressionStatement,
	options: ContextOptions
) => {
	return resolveExpression(expression, options)
}

const resolveBinaryExpression = (
	{ left, right, operator }: acorn.BinaryExpression,
	options: ContextOptions
) => {
	const leftValue = identifierSolver(
		resolveExpression(left as acorn.Expression, options) as DataMap,
		options.property
	) as number
	const rightValue = identifierSolver(
		resolveExpression(right as acorn.Expression, options) as DataMap,
		options.property
	) as number

	if (operator === '+') return leftValue + rightValue
	if (operator === '-') return leftValue - rightValue
	if (operator === '*') return leftValue * rightValue
	if (operator === '/') return leftValue / rightValue
}

const resolveLiteral = (literal: acorn.Literal) => {
	return literal.value
}

const resolveIdentifier = (expression: acorn.Identifier, { context }: ContextOptions) => {
	return context[expression.name]
}

const resolveMemberExpression = (
	expression: acorn.MemberExpression,
	options: ContextOptions
): unknown => {
	const object = resolveExpression(expression.object as acorn.Expression, options)
	const value = resolveExpression(expression.property as acorn.Expression, {
		context: object as DataMap,
		property: options.property,
	})
	return value
}

type ContextOptions = {
	context: DataMap
	property: string
}

export const yaraParse = (
	code: string,
	context: DataMap = {},
	defaultProperty = ''
): GenericType => {
	const program = acorn.parse(code, { ecmaVersion: 2020 })

	//console.log(program.body[0])

	return (
		(resolveStatement(program.body[0] as acorn.Statement, {
			context,
			property: defaultProperty,
		}) as number) ?? NaN
	)
}
