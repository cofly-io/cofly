import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { NodeLink } from '@repo/common';

export class JsCode implements INode {
	node: INodeBasic = {
		kind: 'jscode',
		name: 'JS代码',
		event: "code",
		catalog: 'general',
		version: 1,
		description: "Javascript代码编辑功能",
		icon: 'jscode.svg',
		nodeWidth: 600
	};
	detail: INodeDetail = {
		fields: [
			// 模式选择器（核心联动字段）
			{
				label: 'javascript编辑内容',
				fieldName: 'code',
				control: {
					name: 'jscode',
					dataType: 'string',
					defaultValue: '',
					placeholder: `请输入Javascript脚本,最后要return返回数据...
$input.sum = 100;
let num1 = 5;
let num2 = 9;
let sum = addNumbers(num1, num2);
return $input.sum + sum;
function addNumbers(a, b) {
	return a + b;
}`,
					attributes: [{
						height: 500
					}]
				},
				// AI助手配置
				AIhelp: {
					enable: true,
					rules: '[请帮我生成JavaScript代码，要求：\n1. 代码应该是完整可执行的\n2. 最后必须使用return语句返回结果\n3. 可以使用$current变量访问输入数据\n4. 可以使用$变量访问全局上下文\n5. 请确保代码语法正确且逻辑清晰]'
				}
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		try {
			// 使用类方法创建执行上下文
			const root = this.createStateExecutionContext(opts.state);
			const current = this.createExecutionContext(opts.state?.get("$current") || {});

			// 使用类方法创建安全函数
			const func = this.createSafeFunction(opts.inputs?.code || "");
			const result = await func(root, current);

			return result;
		} catch (error) {
			console.error("用户代码执行错误:", error);
			return {
				error: "执行失败",
				message: error instanceof Error ? error.message : String(error)
			};
		}
	}

	private createExecutionContext(object: any) : any {
		return {
			data: { ...object }
		}
	}

	// 创建安全的执行上下文
	private createStateExecutionContext(state?: Map<string, any>): any {
		const ctx: Record<string, any> = {
			get(key: string) {
				return this[key];
			},
			log(...args: any[]) {
				console.log("[用户代码日志]", ...args);
			},
			now: Date.now,
			stringify: JSON.stringify,
			parse: JSON.parse
		};

		if (state) {
			for (const [key, value] of state.entries()) {
				Object.defineProperty(ctx, key, {
					value,
					writable: false,
					enumerable: true,
					configurable: false
				});
			}
		}

		return ctx;
	}

	private createSafeFunction(code: string): (context: any, current: any) => Promise<any> {
		if (code.trim().length === 0) {
		  return () => Promise.resolve({});
		}
		
		try {
		  const strictCode = `'use strict';\n${code}`;
		  
		  // 使用类型断言确保返回的函数符合签名
		  const func = new Function('$', "$input", `
			try {
			  return (async () => {
				${strictCode}
			  })();
			} catch (error) {
			  return Promise.reject(error);
			}
		  `) as (context: any, current: any) => Promise<any>; // 添加类型断言
		  
		  return func;
		} catch (syntaxError: any) {
		  console.error("用户代码语法错误:", syntaxError);
		  throw new SyntaxError(`代码语法错误: ${syntaxError.message}`);
		}
	  }
}
