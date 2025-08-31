import type { IExecuteOptions, INode, INodeBasic, INodeDetail } from '@repo/common';
import { execSync } from 'child_process';
import * as iconv from 'iconv-lite';

export class CmdCode implements INode {
	node: INodeBasic = {
		kind: 'cmdcode',
		name: '本地命令',
		event: "code",
		catalog: 'general',
		version: 1,
		description: "Command命令操作",
		icon: 'cmdcode.svg',
		nodeWidth: 700
	};
	detail: INodeDetail = {
		fields: [
			{
				displayName: 'Command命令',      // 显示名称
				name: 'command',                 // 字段名
				type: 'string',              // 字段类型
				placeholder: '请输入命令...\nwindows例如:\ndir && echo hello\nLinux例如:\necho "Hello World"\nls -la\nnpm install\ngit status',   // 描述
				default: ``,
				controlType: 'cmdcode'
			},
			{
				displayName: '工作目录',      // 显示名称
				name: 'dir',                 // 字段名
				type: 'string',              // 字段类型
				placeholder: '请输入工作目录路径，例如d:\，留空则使用当前目录',   // 描述
				default: '',
				typeOptions: {
					height: 200,
				},
				controlType: 'input'
			}
		],
	};

	async execute(opts: IExecuteOptions): Promise<any> {
		try {
			const command = opts.inputs?.command;
			if (!command || typeof command !== 'string') {
				throw new Error('命令不能为空');
			}

			// 获取当前系统平台
			const isWindows = process.platform === 'win32';

			// 获取工作目录参数
			const workingDir = opts.inputs?.dir || process.cwd();

			// 执行命令并获取原始缓冲区
			const buffer = execSync(command, {
				encoding: 'buffer', // 始终获取 Buffer
				windowsHide: true, // 避免在Windows上创建额外窗口
				stdio: ['inherit', 'pipe', 'pipe'], // 分离stdout/stderr
				cwd: workingDir, // 设置工作目录
				timeout: 30000 // 30秒超时
			});

			// 处理编码转换
			let stdout: string;
			if (isWindows) {
				// 获取系统当前代码页
				let encoding = 'gbk'; // 默认值
				try {
					const chcpOutput = execSync('chcp', { encoding: 'ascii' });
					const match = chcpOutput.match(/: (\d+)/);
					if (match && match[1]) {
						const codePage = match[1];
						// 常见代码页映射
						switch (codePage) {
							case '936':
								encoding = 'gbk';
								break;
							case '65001':
								encoding = 'utf8';
								break;
							default:
								encoding = `cp${codePage}`;
						}
					}
				} catch (e) {
					// 忽略获取代码页失败的错误
				}

				// 使用 iconv-lite 解码
				if (iconv.encodingExists(encoding)) {
					stdout = iconv.decode(buffer, encoding);
				} else {
					// 如果编码不存在，回退到 gbk
					stdout = iconv.decode(buffer, 'gbk');
				}
			} else {
				// 非Windows系统使用UTF-8
				stdout = buffer.toString('utf8');
			}
			return stdout.trim();
			// return {
			// 	success: true,
			// 	exitCode: 0,
			// 	stdout: stdout.trim(),
			// 	stderr: '',
			// 	workingDir: workingDir
			// };
		} catch (error: any) {
			// 错误处理
			let errorOutput = "";
			let stdout = "";

			// 处理错误输出编码
			if (error.stderr) {
				try {
					if (process.platform === 'win32') {
						// 使用 iconv-lite 解码错误输出
						errorOutput = iconv.decode(error.stderr, 'gbk');
					} else {
						errorOutput = error.stderr.toString('utf8');
					}
				} catch (decodeError) {
					errorOutput = error.stderr.toString('utf8');
				}
			}

			// 处理标准输出（即使有错误也可能有输出）
			if (error.stdout) {
				try {
					if (process.platform === 'win32') {
						stdout = iconv.decode(error.stdout, 'gbk');
					} else {
						stdout = error.stdout.toString('utf8');
					}
				} catch (decodeError) {
					stdout = error.stdout.toString('utf8');
				}
			}

			// 如果没有具体的错误信息，使用通用错误信息
			if (!errorOutput && !stdout) {
				errorOutput = error.message || "命令执行失败";
			}

			return stdout.trim();
			// return {
			// 	success: false,
			// 	stderr: errorOutput.trim(),
			// 	stdout: stdout.trim(),
			// 	workingDir: opts.inputs?.dir || process.cwd(),
			// 	error: error.message
			// };
		}
	}
}

