#!/usr/bin/env python3
"""
parse_mnemonics.py
解析 raw_mnemonics.md → formulas_parsed.json
每条记录：{id, chapter, chapter_name, name, mnemonic, trigger}
"""
import json
import re
from pathlib import Path

RAW = Path('/home/z/my-project/data/raw_mnemonics.md')
OUT = Path('/home/z/my-project/data/formulas_parsed.json')

# 章名映射
CHAPTER_NAMES = {
    1: "解表剂", 2: "泻下剂", 3: "和解剂", 4: "清热剂", 5: "祛暑剂",
    6: "温里剂", 7: "表里双解剂", 8: "补益剂", 9: "固涩剂", 10: "安神剂",
    11: "开窍剂", 12: "理气剂", 13: "理血剂", 14: "治风剂", 15: "治燥剂",
    16: "祛湿剂", 17: "祛痰剂", 18: "消食剂", 19: "驱虫剂", 20: "涌吐剂",
}

# 原站每章应有的方剂数（来自原站首页抓取的数据）
TARGET_COUNTS = {
    1: 13, 2: 11, 3: 9, 4: 20, 5: 8, 6: 13, 7: 4, 8: 24, 9: 9, 10: 3,
    11: 4, 12: 8, 13: 14, 14: 9, 15: 6, 16: 14, 17: 12, 18: 3, 19: 3, 20: 3,
}

def pinyin_id(name: str) -> str:
    """简单做：用名称作为 id 基础。后续可以再优化为拼音。"""
    return name

def parse():
    text = RAW.read_text(encoding='utf-8')
    # 找所有章节标题
    chapter_re = re.compile(r'## 第([一二三四五六七八九十]+)章\s+(\S+)')
    table_row_re = re.compile(r'^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$', re.MULTILINE)
    
    results = []
    current_chapter = 0
    
    # 按章节切分
    parts = re.split(r'## 第([一二三四五六七八九十]+)章\s+', text)
    # parts[0] 是开头 preamble, 然后是 [章号中文, 章节内容, 章号中文, 章节内容, ...]
    
    cn_to_num = {
        "一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
        "六": 6, "七": 7, "八": 8, "九": 9, "十": 10,
    }
    
    def cn2num(s: str) -> int:
        """支持 1-99 的中文数字"""
        if not s:
            return -1
        if "十" not in s:
            return cn_to_num.get(s, -1)
        # 含"十"
        if len(s) == 1:
            return 10
        if len(s) == 2:
            if s[0] == "十":
                return 10 + cn_to_num.get(s[1], 0)
            else:
                return cn_to_num.get(s[0], 0) * 10
        if len(s) == 3:
            return cn_to_num.get(s[0], 0) * 10 + cn_to_num.get(s[2], 0)
        return -1
    
    for i in range(1, len(parts), 2):
        cn_num = parts[i]
        num = cn2num(cn_num)
        if num < 1 or num > 20:
            continue
        
        body = parts[i+1] if i+1 < len(parts) else ""
        # 取首行作为章名（紧跟着 ## 第X章 后面的词）
        # 实际上章名已经在我们 CHAPTER_NAMES 里硬编码
        
        # 解析表格行
        rows = table_row_re.findall(body)
        for name, mnemonic, trigger in rows:
            name = name.strip()
            mnemonic = mnemonic.strip()
            trigger = trigger.strip()
            
            # 跳过分隔行和表头
            if name.startswith("---") or name.startswith(":") or name == "方名":
                continue
            if not name or not mnemonic:
                continue
            
            results.append({
                "id": pinyin_id(name),
                "chapter": num,
                "chapter_name": CHAPTER_NAMES[num],
                "name": name,
                "mnemonic": mnemonic,
                "mnemonic_explanation": "",  # 待 AI 富化
                "traditional_mnemonic": "",  # 待 AI 富化
                "traditional_mnemonic_explanation": "",  # 待 AI 富化
                "ingredients": [],  # 待 AI 富化
                "functions": "",  # 待 AI 富化
                "indications": "",  # 待 AI 富化
                "trigger": trigger,
                "level": "",  # 待 AI 富化（一类方/二类方）
            })
    
    return results

def main():
    formulas = parse()
    print(f"✅ 共解析出 {len(formulas)} 首方剂")
    print()
    
    # 按章节统计
    print("=== 各章方剂数量 ===")
    by_chapter = {}
    for f in formulas:
        c = f["chapter"]
        by_chapter.setdefault(c, []).append(f)
    
    total_target = 0
    total_have = 0
    for c in range(1, 21):
        have = len(by_chapter.get(c, []))
        target = TARGET_COUNTS[c]
        total_have += have
        total_target += target
        diff = target - have
        status = "✓" if diff == 0 else f"⚠️ 缺 {diff}" if diff > 0 else f"溢出 {-diff}"
        print(f"  第{c:2d}章 {CHAPTER_NAMES[c]:8s}  有 {have:2d} / 应 {target:2d}  {status}")
    
    print(f"\n  合计：有 {total_have} / 应 {total_target}  缺 {total_target - total_have}")
    
    # 写出
    OUT.write_text(json.dumps(formulas, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"\n📁 已保存到 {OUT}")

if __name__ == "__main__":
    main()
