// 直接给 dict/*.json 打补丁（不重新生成），并同步到 tools/extra.json / tools/overrides.json 供日后构建使用
const fs=require('fs'),path=require('path');const D=path.join(__dirname,'..','dict');
const common={ // 仓库页头/菜单/弹层常用词条：放进公共词库，即使页面词库未加载也能翻译
 "Pin":"置顶","Unpin":"取消置顶","Watch":"关注","Unwatch":"取消关注","Unstar":"取消星标","Starred":"已加星标",
 "Readme":"自述文件","stars":"星标","star":"星标","watching":"关注","forks":"复刻","fork":"复刻",
 "Branches":"分支","Tags":"标签","branches":"分支","tags":"标签","Go to file":"转到文件","Add file":"添加文件","Create new file":"新建文件","Upload file":"上传文件","Upload files":"上传文件",
 "Switch branches/tags":"切换分支/标签","Find or create a branch…":"查找或创建分支…","Find or create a branch...":"查找或创建分支…","Find a tag…":"查找标签…","Find a tag...":"查找标签…",
 "View all branches":"查看全部分支","View all tags":"查看全部标签","Default":"默认",
 "Clone":"克隆","Clone using the web URL.":"使用 Web URL 克隆。","Download ZIP":"下载 ZIP","Open with GitHub Desktop":"在 GitHub Desktop 中打开","Copy url to clipboard":"复制链接到剪贴板",
 "Use a password-protected SSH key.":"使用受密码保护的 SSH 密钥。","Work fast with our official CLI.":"使用我们的官方 CLI 快速工作。","Learn more about the CLI":"了解更多关于 CLI 的信息",
 "Edit repository details":"编辑仓库详情","Description":"描述","Website":"网站","Enter a valid URL":"请输入有效的 URL","Use your GitHub Pages website":"使用您的 GitHub Pages 站点",
 "Topics (separate with spaces)":"主题（用空格分隔）","Add topics":"添加主题","Include in the home page":"包含在主页中","Releases":"发行版","Deployments":"部署","Packages":"软件包","Save changes":"保存更改"
};
const rules=[["^(\\d+) characters? remaining$","剩余 $1 个字符"," characters"],["^View all (\\d+) branches$","查看全部 $1 个分支","View all "],["^View all (\\d+) tags$","查看全部 $1 个标签","View all "]];
const pageOv={"repository":{"Download ZIP":"下载 ZIP","Unstar":"取消星标","Edit repository details":"编辑仓库详情"}};
function upd(f,fn){const p=path.join(D,f);const d=JSON.parse(fs.readFileSync(p,'utf8'));fn(d);fs.writeFileSync(p,JSON.stringify(d));}
let added=0;upd('_common.json',d=>{for(const k in common){if(d.s[k]!==common[k]){d.s[k]=common[k];added++;}}d.r=d.r||[];for(const r of rules)if(!d.r.some(x=>x[0]===r[0])){d.r.unshift(r);added++;}});
for(const f of fs.readdirSync(D)){if(!f.startsWith('repository'))continue;upd(f,d=>{for(const k of ["Download ZIP","Unstar","Edit repository details","View all branches","View all tags"])if(d.s[k]!==undefined)d.s[k]=common[k];});}
const ex=path.join(__dirname,'extra.json');const e=JSON.parse(fs.readFileSync(ex,'utf8'));Object.assign(e,common);fs.writeFileSync(ex,JSON.stringify(e,null,0));
const ovp=path.join(__dirname,'overrides.json');const ov=JSON.parse(fs.readFileSync(ovp,'utf8'));ov.pages=ov.pages||{};for(const k in pageOv)ov.pages[k]=Object.assign(ov.pages[k]||{},pageOv[k]);ov.commonRules=rules;fs.writeFileSync(ovp,JSON.stringify(ov,null,1));
console.log('common entries changed/added:',added);
