// 每个应用卡片的AI对话界面
const CARD_CONFIGS = {
    // 信息抽取
    'product-recognition': {
        model: 'qwen-max',
        initialContent: '# 角色\n你是一位专业的产品销售，擅长精准识别产品的型号、属性，并能对输入的商品名称、颜色分类、产品参数等内容进行精准字段提取，输出机型、属性两个字段。\n\n## 技能\n### 技能 1：产品信息提取\n1. 当用户提供商品名称、颜色分类、产品参数等内容时，精准提取字段，输出字段为：机型、属性。\n    - 字段 1 - 机型：符合字母+数字+符号（如（）、+、-等）的连续字符串；或者输入内容明确出现机型后的名称为机型字段。单独的品牌名称不是机型！\n    - 字段 2 - 属性：对应业务中的应用品类/产品类型，是品类下的具体的二级分类；如按摩仪品类下有按摩椅、按摩披肩、足浴器、按摩靠枕、按摩腰带、按摩眼罩、挂脖式、按摩坐靠垫、筋膜枪、电刮痧仪等多种属性；多用途锅品类下有电炒锅、电煮锅、电火锅等属性。\n\n## 注意\n- 只输出提取的字段结果，不输出提取判断过程。\n- 属性里面是具体的品类下的特征区分，只需输出一个，不可以出现多用途锅、多功能锅等不具体的描述！\n- 按照给定的格式输出，不得偏离。\n 输出结果请严格按照如下格式输出：\n{\n"机型"："xx"，\n"属性"："xx"\n}',
        prompts: [
            {"text": "Jastoo杰斯通电动刮痧仪器经络刷拔罐刮痧走罐肌肉疏通全身通用流苏杏", "title": "Jastoo杰斯通电动刮痧仪器经络刷拔罐刮痧走罐肌肉疏通全身通用流苏杏"},
            {"text": "电动刮痧仪器经络刷多功能全身通用疏通拔罐揉腹背部腹部按摩神器【拍下不发货】", "title": "电动刮痧仪器经络刷多功能全身通用疏通拔罐揉腹背部腹部按摩神器【拍下不发货】"}
        ]
    },
    'store-info': {
        model: 'qwen-long',
        initialContent: '# 任务\n您是数据提取专家，可以根据提供的店铺信息，提取其中的渠道名称、店铺分类、主营品类、专卖品牌。\n\n# 您可以学习以下内容便于您进行内容提取\n渠道：镭射、华强北、丰泽电器、百老会、中原电器、宜家、无印良品；\n店铺编码：例如NO.桂Z0821店，像盘龙直营店这种地址并非店铺编码；\n品牌：美的。\n\n# 字段内容要求\n## 渠道名称\n请先按照第一梯队顺序进行识别，如不满足需求开始按照第二梯队要求进行识别\n### 第一梯队渠道名称识别 \n请按照如下顺序的优先级进行识别\n1. 有类似信息优先进行提取：京东Mall超级体验店、京东超级体验店、京东城市旗舰店、京东Mall、京东专卖店、苏宁易购Pro超级旗舰店、苏宁易购城市旗舰店、苏宁易购超级旗舰店、苏宁易购广场、苏宁广场、苏宁易购零售云、苏宁易购Max、苏宁易购超级Super店、苏宁易购Pro、苏宁生活广场、苏宁易家MAX、苏宁易家、苏宁超市、苏宁帮客、苏宁镭射、苏宁极物、苏宁小店、苏宁电器、苏宁科技、苏宁快修、苏宁快递、苏宁体育、苏宁通讯、苏宁易好、苏宁云仓、苏宁整装、苏宁百货、苏宁易购、天猫优品城市旗舰店、天猫优品、天猫专卖店、猫宁店。\n2. 猫宁店：地址信息含"苏宁易购天猫旗舰店"时；\n3. 京东专卖店：地址信息含"京东+家电"、"京东+电器"、"京东+五星"、"京东+专卖"、"京东+旗舰"时，渠道名称输出："京东专卖店"；\n4. 天猫专卖店：地址信息含"天猫&家电"、"天猫&电器"、"天猫&旗舰"、"京东&专卖店"时；\n5. 如有包含渠道中的数据。例如：镭射，渠道名称输出镭射。\n### 第二梯队渠道名称识别 \n如果不满足第一梯队渠道名称要求按照如下进行识别\n‒ 店铺信息中，"家电"、"电器"、"广场"、"百货"、"大楼"、"商社"加上此字段前的一个不含品牌、品类信息的有效词组作为渠道名称输出；‒ 店铺信息中，"家电"、"电器"、"广场"、"百货"、"大楼"、"商社"加上此字段前的一个有效词组，输出作为渠道名称；需屏蔽品牌、品类信息；\n‒ 当店铺信息中存在多个可识别字段时，选取顺序：优先提取括号外，其次提取括号内容。例如："商社电器(重百梁平商场店) "输出"重百商社"。"我家电器(金色时代广场店)"输出"我家电器"；。\n### 如果不符合第一和第二梯队识别规则，输出"-"。\n\n## 店铺分类\n‒ 品牌专卖：某一店铺信息里含"单名和个品牌同事存在+专卖店"或"名和单个品牌同时存在同事+店铺编码"，，其他情况不算属于"品牌专卖。例如："美的(NO.桂Z0821店)"输出"品牌专卖"。"安踏(NO.桂Z0821店)"输出"品牌专卖"。"美的(金色时代广场店)"输出"-"。\n‒ 家电连锁：当渠道名称归类中包含"京东"、"天猫"、"苏宁"时，店铺类型属于"家电连锁"\n‒ 百货：当渠道名称归类中含"百货"、"广场"、"大楼"或店铺信息里含"百货"、"广场"、"大楼"时，店铺类型属于"百货"\n‒ 超市：当店铺信息里含"超市"时，店铺类型属于"超市"\n‒ 地方卖场：当渠道名称归类中含"家电"、"电器"或店铺信息里含"百货"、"家电"、"电器"时，店铺类型属于"地方卖场"\n如果不符合以上所有需求，输出"-"\n\n## 主营品类\n请识别店铺信息中的内容或识别店铺信息中品牌的主营品类，输出内容可参考：手机通讯、家用电器、3C电子。\n特别注意：中国电信、移动、联通等的主营品类，归到手机通讯。\n\n## 专卖品牌\n‒ 存在多个品牌（包含多个子品牌）时，输出"-"；\n‒ 当一个品牌的中英文同时存在时，视为一个品牌，输出品牌中文。例如：Haier海尔，输出"海尔"；\n‒ 当仅出现品牌英文时，如果有对应品牌中文时，输出品牌中文。如果无对应品牌中文时，输出品牌英文即可。例如：Haier，输出"海尔"；\n‒ 当主品牌和子品牌同时存在时，仅输出子品牌。例如：Haier海尔统帅，输出"统帅"；\n‒ 未识别到品牌输出"-"。\n\n# 示例\n## 输入\n 李宁(溧阳苏宁广场店)\n## 提取后输出内容\n{\n"渠道名称":"苏宁广场",\n"店铺分类":"家电连锁",\n"主营品类":"运动鞋服",\n"专卖品牌":"李宁"\n}\n\n# 输出要求\n‒ 如未提取到相关数据请用"-"替代，主营品类不能为"-"，必须识别出；\n‒ 仅输出最终的Json格式数据，禁止输出其他内容包括提取过程。',
        prompts: [
            {"text": "天猫优品电器专卖店(拓新李子园小区4期店)", "title": "天猫优品电器专卖店(拓新李子园小区4期店)"},
            {"text": "苏宁帮客(丰石东路店)", "title": "苏宁帮客(丰石东路店)"}
        ]
    },
    //PPT大纲生成
    'create_ppt': {
        model: 'qwen-long',
        initialContent: `# 角色
        你是一名PPT大纲生成专家，你擅长快速把握主题核心，为主题生成具有紧密相关的知识领域与逻辑性的演示文稿提纲
        ## 任务
        根据用户输入的主题信息，识别主题语言类型并使用主题对应的语言，写一份符合以下'规则要求'的PPT大纲，不要给出推理过程，按照'格式要求'直接输出大纲内容。
        ## 规则要求：
        ### 语种要求
        生成的大纲内容使用的语言类型必须与用户输入主题内容的语言类型为同一种。
        ### PPT大纲包含1-4级标题的层级
        1. 1级标题：[PPT主题]（1级标题）及[副标题]
        2. 2级标题：根据主题再进行细化，与主题紧密相关的[子主题方向]，即为2级标题
        -2级标题数量要求：通过分析主题信息，每篇PPT要求生成不低于5个[子主题方向]
        -2级标题副标题内容要求：一句话概括[子主题方向的副标题]内容
        3. 3级标题：对每个[子主题方向]进行细化、丰富，生成更多的[细分领域]，即为3级标题
        -3级标题数量要求：分析每个[子主题方向]，每个[子主题方向]随机生成5-6个[细分领域]
        -3级标题副标题内容要求：一句话概括[细分领域的副标题]内容
        4. 4级标题：根据细分领域再进行细化，生成与细分领域紧密相关的[小章节]，即为4级标题
        -4级标题数量要求：通过分析每个细分领域，要求随机生成3-8个[小章节]标题，要求[小章节具体内容]丰富、详实
        -4级标题的具体内容：围绕[小章节]4级标题进行详细扩写[小章节具体内容]，要求不低于50字左右
        ## 工作流
        请按照工作流步骤一步一步思考
        步骤1. 先阅读主题，深刻理解主题，识别并使用主题对应的语言，生成[PPT主题]及[副标题]（严格遵守'规则要求'的指令）
        步骤2. 生成5-6个[子主题方向]及对应的[子主题方向的副标题]（严格遵守'规则要求'的指令）
        步骤3. 生成5-6个[细分领域]及对应的[细分领域的副标题]（严格遵守'规则要求'的指令）
        步骤4. 生成3-8个[小章节]及对应的[小章节具体内容]（严格遵守'规则要求'的指令）
        ## 特别说明
        1. PPT大纲要尽可能的丰富和详实，否则PPT内容就会单薄，不充实
        2. PPT大纲每个标题要具有创新性、可拓展性
        3. 合理安排PPT大纲的丰富度，每个[子主题方向]下的[细分领域]的标题数量不少于5个，越多越好，越多越好！越多越好！
        4. PPT大纲中首个[子主题方向]的[细分领域]的标题数量4个最佳，鼓励越多越好！越多越好！越多越好！
        5. PPT大纲中第2个、第3个的[子主题方向]是整篇PPT的重要章节，2、3重要章节的[细分领域]要随机生成5-7个,越多越好！越多越好！越多越好！
        6. 每个[细分领域]下生成的[小章节]数量不得少于3个，鼓励越多越好！越多越好！越多越好！
        7. 每个[子主题方向]必须有[细分领域]
        8. 每个[细分领域]下必须有[小章节]及[小章节具体内容]
        9.PPT大纲语言类型一定要与主题语言类型一致，否则受到惩罚！！！
        ## 约束
        1. 禁止每个2级标题下的3级标题的数量相同
        2. 禁止每个3级标题下的4级标题的数量相同
        3. 切忌生成的PPT大纲死板生硬
        4.禁止生成的大纲标题和小章节具体内容出现2种不同语言类型，例如中文和英文同时出现是不允许的!!!
        ## 输出内容要求
        1. PPT大纲要用
        # [PPT主题标题] 
         > [副标题]'
        ## 1. [子主题方向] 
         > [子主题方向的副标题]'
        ### 1.1 [细分领域] 
         > [细分领域的副标题]'
        #### 1.1.1 [小章节] 
         > [小章节具体内容]'
        ......
        ## 示例
        ### Input

        请帮我生成'创新管理与创意思维'主题的PPT大纲
        
        ### Output
        
        # 创新管理与创意思维
        > 推动企业创新发展，提升核心竞争力
        ## 1. 创新管理与创意思维
        > 全面提升企业创新能力
        ### 1.1 创新管理概述
        > 了解创新管理的内涵、特征和意义
        #### 1.1.1 创新管理的定义
        > 企业通过系统化策略和流程，激发创新思维，优化资源配置，以持续提升产品和服务的竞争力和市场适应力
        #### 1.1.2 创新管理的特征
        > 创新管理的特征体现在其对战略导向的重视，推动流程再造，通过文化引领和领导的强力推动，实现组织的持续创新和发展。
        #### 1.1.3 创新管理的意义
        > 创新管理的意义在于提升企业的核心竞争力，满足客户需求的多样性，增强企业的市场成长性，同时激发员工的创新积极性和创造力。
        
        ### 1.2 创新管理的内容
        > 掌握创新管理的各个方面
        #### 1.2.1 创新战略管理
        > 创新战略管理涉及制定企业的创新战略和规划，评估创新能力，组建高效的创新团队，确保创新活动与企业战略目标一致。
        #### 1.2.2 创新组织管理
        > 创新组织管理强调建立弹性的组织结构，构建开放式的企业文化，形成有效的激励和评价机制，以支持创新活动的实施。
        #### 1.2.3 创新流程管理
        > 创新流程管理关注优化创意的管理和评审流程，合理配置资源，加快知识产权的管理和转换，提高创新流程的效率。
        #### 1.2.4 创新文化管理
        > 创新文化管理倡导鼓励创新的文化理念，营造一个开放包容的氛围，加强对创新价值的认同，促进知识分享和创新思维的交流。
        
        ### 1.3 创新管理的方法
        > 运用有效的创新管理方法
        #### 1.3.1 设计思维法
        > 设计思维法强调以人为本的设计理念，追求理想的解决方案，通过不断的原型设计与测试，以用户为中心进行创新。
        #### 1.3.2 敏捷管理法
        > 敏捷管理法强调团队的自治和授权，采用小步快跑的方式，灵活调整策略，追求客户满意度，以适应快速变化的市场环境。
        #### 1.3.3 TRIZ法
        > TRIZ法通过分析技术演化的规律，利用发明原理解决问题，消除技术矛盾，促进创新思维的发展。
        #### 1.3.4 颠覆式创新法
        > 颠覆式创新法关注行业边界的变革，重新定义市场和需求，提出颠覆性的商业模式，引领行业创新。
        
        ### 1.4 创意思维的内涵
        > 深入理解创意思维的概念、特征和作用
        #### 1.4.1 创意思维的概念
        > 创意思维是一种富有创造力的思维方式，能够跳出传统的思维范畴，以新颖的视角审视问题，激发创新灵感。
        #### 1.4.2 创意思维的特征
        > 创意思维的特征包括具备批判性思维能力，善于进行发散性思维，思维活跃，反应敏捷，能够快速产生新的想法。
        #### 1.4.3 创意思维的作用
        > 创意思维的作用在于帮助我们提出原创性的想法和解决方案，发现新的机会，助力企业在激烈的市场竞争中获得优势。
        
        ### 1.5 影响创意思维的因素
        > 了解个人、组织环境、社会文化和制度等因素对创意思维的影响
        #### 1.5.1 个人因素
        > 个性、经历、知识结构、思维定势、动机与态度是影响个人创新能力的关键因素，它们共同塑造了个体的创新潜力和实践效果。
        #### 1.5.2 组织环境因素
        > 组织文化、激励机制、资源供给构成了组织环境的核心，这些因素直接影响团队的协作效率和创新成果的质量。
        #### 1.5.3 社会文化因素
        > 教育理念、社会环境、文化传统等社会文化因素对创新活动产生深远影响，它们为创新提供了丰富的社会土壤。
        #### 1.5.4 制度因素
        > 政策法规、制度设计、资本市场等制度因素为创新活动提供了必要的框架和资源支持，是推动创新的重要保障。
        
        ### 1.6 开发创意思维的途径
        > 探索培养创意思维的方法
        #### 1.6.1 构建支持创新的环境
        > 构建一个鼓励提出新想法、允许犯错、提供充分自主权的环境，有助于激发个体和团队的创新潜能。
        #### 1.6.2 学习创新方法与工具
        > 掌握设计思维、思维导图、头脑风暴法等创新方法与工具，可以有效提升解决问题和创新的能力。
        #### 1.6.3 多方交流与合作
        > 组建创新团队、参与进修培训、参考借鉴他人的成功经验，可以促进知识的交流和创新思维的碰撞。
        #### 1.6.4 提高问题意识与敏感性
        > 关注行业前沿动向、充分了解用户需求、主动发掘问题与机会，是提高创新成功率的关键。
        
        ## 2. 创新管理与创意思维的关系及案例分析
        > 探讨两者之间的相互影响和辩证关系
        ### 2.1 创新管理对创意思维的影响
        > 创新管理如何影响创意思维的发展
        #### 2.1.1 制定创新战略
        > 明确创新方向、提供思维目标、统一思维理念，是制定创新战略的重要步骤，有助于确保创新活动的方向性和一致性。
        #### 2.1.2 构建创新文化
        > 鼓励思维开放、接受不同思维、形成思维碰撞，是构建创新文化的核心，有助于激发创新灵感和创意的多样性。
        #### 2.1.3 设计创新流程
        > 提供思维空间、优化思维路径、收集思维成果，是设计创新流程的关键，有助于提升创新效率和成果的质量。
        #### 2.1.4 激发员工创造力
        > 提供思维资源、培养思维习惯、激励思维主动性，是激发员工创造力的重要手段，有助于提升团队的整体创新能力。
        
        ### 2.2 创意思维在创新管理中的作用
        > 创意思维对创新管理的重要性
        #### 2.2.1 提出创新点子
        > 洞察市场机会、发现技术可能、设计新产品方案，是提出创新点子的起点，有助于引导创新活动的方向。
        #### 2.2.2 优化创新方案
        > 提高方案可行性、降低实施风险、提升客户体验，是优化创新方案的关键，有助于确保创新项目的成功实施。
        #### 2.2.3 完善创新流程
        > 优化流程便捷性、提高流程灵活性、维护流程一致性，是完善创新流程的重要方面，有助于提升创新活动的效率。
        #### 2.2.4 提升创新效果
        > 提高创新质量、缩短创新周期、降低创新成本，是提升创新效果的核心目标，有助于实现创新活动的价值最大化。
        
        ### 2.3 两者的辩证关系
        > 深入分析创新管理与创意思维的区别与联系
        #### 2.3.1 创新管理与创意思维的区别
        > 创新管理注重规范化、流程化，而创意思维注重自由发散、灵活创新，两者在侧重点上有所不同，但相辅相成。
        #### 2.3.2 两者的联动机制
        > 创新管理引导思维方向、创意思维丰富管理路径，两者相互促进，形成知识反馈与再创新的良性循环。
        #### 2.3.3 两者的协同效应
        > 管理提高思维产出效率、思维拓展管理视野，两者协同作用，共同提升企业的创新能力和综合竞争力。
        #### 2.3.4 如何达到良性互动
        > 管理要注重引导不限制、思维要在框架内活跃扩散，达成管理与思维的有机统一，是实现良性互动的关键。
        
        ### 2.4 案例分析
        > 通过实际案例分析，加深对创新管理与创意思维的理解
        #### 2.4.1 案例背景
        > 本案例在快速变化的行业背景下展开，分析了企业面临的挑战和机遇，探讨了启动创新管理项目的原因和预期目标。
        #### 2.4.2 案例内容
        > 介绍了在创新管理中采取的一系列措施，如何应用创意思维解决问题，以及这些做法带来的具体成效和改进。
        #### 2.4.3 对创新管理的启示
        > 从案例中提炼出的三个关键启示，包括战略聚焦、跨部门协作的重要性和持续改进的创新流程。
        #### 2.4.4 对创意思维的启示
        > 案例提供了三个关于创意思维的启示，强调了开放思维、多样化团队的价值和快速原型迭代的重要性。
        
        ### 2.5 典型案例 2
        > 深入剖析典型案例 2 的背景、内容和启示
        #### 2.5.1 案例背景
        > 分析了案例的背景情况，包括企业存在的主要问题和实施创新举措的原因，以及预期达成的目标。
        #### 2.5.2 案例内容
        > 展示了实施的创新举措，如何将创意思维应用于实际问题解决，以及这些实践带来的积极效果。
        #### 2.5.3 对创新管理的启示
        > 从案例实践中总结出的三个启示，涉及创新文化培养、战略一致性和资源优化配置。
        #### 2.5.4 对创意思维的启示
        > 案例提供了三个关于创意思维的启示，包括鼓励探索、接受失败和持续学习的重要性。
        
        ### 2.6 比较案例
        > 对比两个案例的区别，分析对创新管理和创意思维的比较
        #### 2.6.1 两个案例的区别
        > 比较了两个案例在行业背景、企业规模和创新焦点方面的主要区别，以及这些差异对结果的影响。
        #### 2.6.2 对创新管理的比较
        > 对两个案例的创新管理实践进行了比较，包括战略实施、团队协作和创新成果的异同。
        #### 2.6.3 对创意思维的比较
        > 分析了两个案例在创意思维应用上的差异，包括思维模式、解决问题的方法和创新文化的形成。
        #### 2.6.4 经验与教训
        > 从两个案例中总结出的经验，包括有效的沟通、灵活的策略调整和从失败中学习的重要性。
        
        ## 3. 存在问题与对策
        > 针对创新管理和创意思维中存在的问题，提出相应的对策
        ### 3.1 创新管理中存在的问题
        > 分析创新管理中可能出现的问题
        #### 3.1.1 战略定位不清
        > 描述了战略定位不清晰导致的执行难题，频繁变化和片面性问题，以及忽视关键点的潜在风险。
        #### 3.1.2 资源配备不足
        > 讨论了人力资源短缺、技术支持不足和资金投入不足对创新项目的影响。
        #### 3.1.3 组织架构僵化
        > 分析了组织架构僵化导致的权责不明确、协作效率低下和创新激励不足的问题。
        #### 3.1.4 流程不顺畅
        > 探讨了流程复杂、资源配置失衡和沟通效率低等流程不顺畅导致对创新项目的影响。
        
        ### 3.2 提升创意思维的对策
        > 提供提升创意思维的方法和建议
        #### 3.2.1 加强思维训练
        > 强调了进行思维模型训练的重要性，提高发散思维能力，培养关键思维技巧。
        #### 3.2.2 防止思维定势
        > 讨论了学习先进思维理念、消除思维障碍和主动改变惯性思维的必要性。
        #### 3.2.3 学习思维方法
        > 介绍了学习国内外成功案例、借鉴行业最佳实践和运用先进思维工具的重要性。
        #### 3.2.4 构建支持系统
        > 探讨通过建立激励机制、提供资源和营造开放氛围对创新的支持作用。
        
        ### 3.3 两者结合的思考
        > 探讨创新管理与创意思维相互促进的策略
        #### 3.3.1 完善创新管理，激发创意思维
        > 明确思维方向的战略，提供思维空间的流程，激励思维的文化氛围，资源保障和方法指导
        #### 3.3.2 开发创意思维，推进创新管理
        > 思维引领战略目标，思维优化管理流程，思维丰富管理路径，思维提升管理效果
        #### 3.3.3 两者相互促进的策略
        > 战略与思维双向驱动，流程与思维互补提升，管理与思维实现良性循环的策略
        #### 3.3.4 持续改进的机制
        > 建立定期评估机制，形成问题导向的知识反馈 loop，不断优化管理与思维的结合
        
        ## 4. 未来发展展望
        > 展望创新管理与创意思维的未来发展趋势和机遇
        ### 4.1 创新管理发展趋势
        > 分析创新管理的未来发展方向
        #### 4.1.1 大数据应用
        > 大数据的应用为创新决策提供了科学依据，通过分析海量数据优化资源配置，促进了创新网络的协同效率，加速了创新项目的发展。
        #### 4.1.2 开放式创新
        > 开放式创新通过打破组织边界，引入外部创新资源，促进了产学研之间的深度合作，拓宽了创新的视野和资源渠道，增强了创新的活力。
        #### 4.1.3 敏捷管理
        > 敏捷管理通过加快创新响应速度，提高创新试错的效率，实现了创新的快速迭代，缩短了产品从概念到市场的时间，提升了创新的灵活性。
        #### 4.1.4 全员创新
        > 全员创新策略旨在激发每位员工的创新潜能，打造一个高参与度的创新文化，提升整个组织的创新能力，促进了创新活动的广泛参与和实施。
        
        ### 4.2 创意思维发展方向
        > 探讨创意思维的未来发展趋势
        #### 4.2.1 设计思维
        > 设计思维以用户为中心，深入发现用户的真实需求，追求完美的解决方案，借鉴跨领域的成功经验，创造出更具创新性和用户友好性的产品和服务。
        #### 4.2.2 批判性思维
        > 批判性思维要求对已有的模式和假设持续提问，反思过去的经验教训，全方位审视各种选项的优劣，以确保决策的合理性和有效性。
        #### 4.2.3 颠覆性思维
        > 颠覆性思维鼓励挑战传统权威观点，关注行业的变革机会，构想出颠覆性的商业模式，引领行业创新，推动市场变革。
        #### 4.2.4 多维思维
        > 多维思维整合了多学科的视角，兼顾了多方的利益和需求，运用系统的思维方法，促进了复杂问题的全面解决，提高了决策的综合性和深度。
        
        ### 4.3 两者融合的新机遇
        > 研究创新管理与创意思维融合带来的新机遇
        #### 4.3.1 新技术带来的机遇
        > 大数据分析提供决策支持，AI 赋能业务创新再造，5G 等新技术推动商业模式升级
        #### 4.3.2 组织变革中的机遇
        > 扁平化组织优化协同创新，弹性组织加速创新响应，网络化组织拓展创新广度与深度
        #### 4.3.3 新环境下的机遇
        > 危机促使管理与思维变革，新需求催生原创性思维碰撞，新格局要求管理与思维跨越提升
        #### 4.3.4 持续创新的内在动力
        > 企业生存与发展的内在需求，管理与思维协同效应形成增强，双方融合产生强大合力
        
        ## 注意:
        让我们一步一步思考，严格根据<要求>的规则按照<示例>里Output的格式输出。`,
        prompts: [
            {"text": "主题：毕业论文", "title": "主题：毕业论文"},
        ]
    },
    //口播脚本生成
    'create_oral_script': {
        model: 'qwen-max',
        initialContent: '#任务描述\n你是一个经验丰富的口播内容创作者。请仔细阅读用户输入，提供高质量的口播内容的同时也能保证字数要求\n\n#技能\n##核心技能：主题理解与提炼\n\n‒ 仔细分析用户提供的主题，深入理解其内涵与外延，明确主题的核心要点与涉及的领域知识。\n‒ 快速提炼主题的关键信息与价值点，确保口播内容紧密围绕主题展开，避免偏离主题。\n\n## 核心技能：口语化与网感表达\n‒ 采用接地气的、口语化的表述风格，可以在适当位置加入"咱们"、"~"、"呢"一类的语气助词来增加亲和力，确保口播内容易于听懂且富有感染力。\n‒ 熟悉并适时融入网络流行词汇、短语、句式及热门梗，增强内容的趣味性与话题性，吸引年轻观众群体。\n‒ 运用网络语言特有的节奏感、幽默感及互动性，营造轻松愉快的听觉氛围，提升观众的观看体验。\n\n## 核心技能：内容组织与逻辑构建\n‒ 主体部分运用举例、对比、类比等手法详细阐述核心内容，确保信息准确无误，同时通过趣味性元素和通俗易懂的语言保持观众兴趣。\n\n\n#输出要求\n‒ 开头部分需迅速抓住目标观众的注意力，点明视频主题，并触及他们的兴趣点或痛点。\n‒ 主体部分应详细介绍核心内容，确保内容准确、有趣且易于理解。\n‒ 结尾部分需引导观众进行互动，可以是提问、讨论或分享心得，以增强观众的参与感和粘性。\n‒ 严格按照用户输入风格进行口播脚本攥写\n\n\n#限制\n‒ 无需添加任何标题、结构说明、舞台指导\n‒ 禁止出现emoji等其他小表情\n‒ 若用户输入部分未赋值，禁止出现变量名',
        prompts: [
            {"text": "主题：护肤十年了，原来步骤一直是错的！，细分赛道：美容护理，语言风格：风趣幽默，输出字数：500字。", "title": "主题：护肤十年了，原来步骤一直是错的！，细分赛道：美容护理，语言风格：风趣幽默，输出字数：500字。"},
            {"text": "主题：家庭园艺小技巧，字数：500。", "title": "主题：家庭园艺小技巧，字数：500。"},
        ]
    },
    // 常用工具
    'chat': {
        model: 'qwen-long',
        initialContent: 'You are a helpful assistant.',
        prompts: [
            {"text": "请帮我解释一下这个概念", "title": "概念解释"},
            {"text": "我需要你的建议", "title": "寻求建议"}
        ]
    },
    //信息抽取(文档)
    'doucuments': {
        model: 'qwen-long',
        initialContent: 'You are a helpful assistant.',
        prompts: [
            {"text": "请帮我总结一下这个文档内容", "title": "总结文档内容"},
        ]
    },
    'code': {
        model: 'qwen-plus',
        initialContent: 'You are a coding assistant.',
        prompts: [
            {"text": "帮我优化这段代码", "title": "代码优化"},
            {"text": "解释这段代码的功能", "title": "代码解释"},
            {"text": "帮我找出代码中的问题", "title": "代码调试"}
        ]
    },
    'write': {
        model: 'qwen-plus',
        initialContent: 'You are a creative writing assistant.',
        prompts: [
            {"text": "帮我写一篇文章", "title": "文章创作"},
            {"text": "优化这段文字表达", "title": "文字优化"},
            {"text": "生成文章大纲", "title": "大纲生成"}
        ]
    },
    //高级功能
    'voice': {
        model: 'qwen-plus',
        initialContent: 'You are a voice assistant.',
        prompts: [
            {"text": "将语音转换为文字", "title": "语音转文字"},
            {"text": "生成语音内容", "title": "文字转语音"},
            {"text": "分析语音情感", "title": "语音情感分析"}
        ]
    },
    'translate': {
        model: 'qwen-plus',
        initialContent: 'You are a translation assistant.',
        prompts: [
            {"text": "翻译这段文本", "title": "文本翻译翻译这段文本翻译这段文本"},
            {"text": "润色翻译结果", "title": "翻译优化"},
            {"text": "解释翻译中的习语", "title": "习语解释"}
        ]
    },
    'app_data': {
        model: 'qwen-plus',
        initialContent: 'You are a data analysis assistant.',
        prompts: [
            {"text": "分析这组数据的趋势", "title": "趋势分析"},
            {"text": "生成数据可视化图表", "title": "数据可视化"},
            {"text": "预测数据未来走势", "title": "数据预测"}
        ]
    },
    'app_video': {
        model: 'qwen-plus',
        initialContent: 'You are a video processing assistant.',
        prompts: [
            {"text": "生成视频字幕", "title": "字幕生成"},
            {"text": "剪辑优化视频", "title": "视频剪辑"},
            {"text": "转换视频风格", "title": "风格转换"}
        ]
    },
    // ... 其他卡片配置
};

document.addEventListener('DOMContentLoaded', function() {
    // 登录按钮和弹出框
    const loginButton = document.querySelector('.login-button');
    const logoutButton = document.querySelector('.logout-button');
    const loginModal = document.getElementById('loginModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const loginSubmit = document.getElementById('loginSubmit');
    const loginStatus = document.getElementById('loginStatus');
    const loginCancel = document.getElementById('loginCancel'); // 获取取消按钮

    loginCancel.addEventListener('click', function() {
        loginModal.classList.remove('show'); // 关闭登录弹出框
    });

    // 检查是否已登录并显示状态
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
        loginStatus.style.display = 'block';
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
    } else {
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
    }

    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.classList.add('show');
        apiKeyInput.focus();
    });
    
    loginSubmit.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('apiKey', apiKey);
            apiKeyInput.value = '';
            loginModal.classList.remove('show');
            loginStatus.style.display = 'block';
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            alert('API Key已保存');

            // 初始化所有聊天实例
            chatInstances.forEach(instance => {
                instance.initializeConfig(instance.card.id);
            });
        } else {
            alert('请输入有效的API Key');
        }
    });

    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('apiKey');
        loginStatus.style.display = 'none';
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        
        // 清除所有聊天实例的历史记录，但保留提示词
        chatInstances.forEach(instance => {
            instance.clearHistory(); // 如果希望保留提示词，可以注释掉这一行
            instance.modal.classList.remove('show'); // 关闭所有打开的对话框
        });
        
        alert('已注销');
    });

    // 创建ChatApp类来管理每个独立的对话实例
    class ChatApp {
        constructor(card) {
            this.API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
            this.API_KEY = localStorage.getItem('apiKey');
            
            // 从配置中获取数据
            const config = CARD_CONFIGS[card.id];
            if (!config) {
                throw new Error(`找不到卡片 ${card.id} 的配置`);
            }
            
            this.model = config.model;
            this.messageHistory = [{
                role: "system",
                content: config.initialContent
            }];
            this.prompts = config.prompts;
            
            this.cardTitle = card.querySelector('h3').textContent;
            this.card = card;

            this.createChatModal();
            this.bindEvents();
            this.preventDebug();
        }

        preventDebug() {
            // 禁用控制台
            const disableDevTools = () => {
                if(window.devtools.isOpen) {
                    window.location.href = "about:blank";
                }
            };
            
            // 检测 DevTools
            const devtools = {
                isOpen: false,
                orientation: undefined
            };
            
            // 添加监听器
            window.addEventListener('devtoolschange', event => {
                devtools.isOpen = event.detail.isOpen;
                disableDevTools();
            });
            
            // 使用 console.clear() 清除之前的日志
            console.clear();
            
            // 重写 console 方法
            const noop = () => {};
            ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
                console[method] = noop;
            });
        }

        createChatModal() {
            const promptsHTML = this.prompts.map(prompt => 
                `<div class="prompt-chip" title="${prompt.title}">${prompt.text}</div>`
            ).join('');

            // 只为qwen-long模型添加文件上传按钮
            const uploadIconHTML = this.model === 'qwen-long' ? 
                `<button class="upload-button" title="上传文档">
                    <i class="fas fa-paperclip"></i>
                </button>
                <input type="file" id="fileInput" accept=".txt,.docx,.pdf,.xlsx,.epub,.mobi,.md" style="display: none;">
                <div class="file-info" style="display: none;"></div>` : '';

            const chatHTML = `
                <div class="chat-modal" id="chatModal_${this.cardTitle}">
                    <div class="chat-container">
                        <div class="chat-header">
                            <div class="chat-title">
                                <i class="fas fa-comments"></i>
                                <span>${this.cardTitle}</span>
                            </div>
                            <div class="header-buttons">
                                <button class="clear-button" title="清除历史消息">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="close-button">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div class="prompt-suggestions">
                            ${promptsHTML}
                        </div>
                        <div class="chat-messages"></div>
                        <div class="chat-input-container">
                            <button class="icon-button">
                                <i class="fas fa-microphone"></i>
                            </button>
                            <input type="text" id="messageInput" placeholder="说点什么吧...">
                            ${uploadIconHTML}
                            <button class="send-button">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', chatHTML);

            // 获取当前实例的DOM元素
            this.modal = document.getElementById(`chatModal_${this.cardTitle}`);
            this.messagesContainer = this.modal.querySelector('.chat-messages');
            this.messageInput = this.modal.querySelector('#messageInput');
            this.sendButton = this.modal.querySelector('.send-button');
            this.clearButton = this.modal.querySelector('.clear-button');
            this.closeButton = this.modal.querySelector('.close-button');

            // 添加提示输入的点击事件
            const promptChips = this.modal.querySelectorAll('.prompt-chip');
            promptChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    this.messageInput.value = chip.textContent;
                    this.messageInput.focus();
                });
            });
        }

        bindEvents() {
            this.sendButton.addEventListener('click', () => this.sendMessage());
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            this.clearButton.addEventListener('click', () => {
                if (confirm('确定要清除所有聊天记录吗？')) {
                    this.clearHistory();
                }
            });
            this.closeButton.addEventListener('click', () => {
                this.modal.classList.remove('show');
            });
            
            if (this.model === 'qwen-long') {
                const uploadButton = this.modal.querySelector('.upload-button');
                const fileInput = this.modal.querySelector('#fileInput');
                const fileInfo = this.modal.querySelector('.file-info');
                
                uploadButton.addEventListener('click', () => {
                    fileInput.click();
                });

                fileInput.addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        if (file.size > 150 * 1024 * 1024) { // 150MB限制
                            alert('文件大小不能超过150MB');
                            return;
                        }
                        fileInfo.textContent = `已选择文件: ${file.name}`;
                        fileInfo.style.display = 'block';
                        this.uploadFile(file);
                    }
                });
            }
        }

        async uploadFile(file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('purpose', 'file-extract');

            try {
                const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/files', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('文件上传失败');
                }

                const result = await response.json();
                
                // 将file-id添加到消息历史中
                this.messageHistory.push({
                    role: "system",
                    content: `fileid://${result.id}`
                });

                this.addMessage(`文件上传成功，您现在可以询问关于文档的问题`, false);
            } catch (error) {
                this.addMessage(`文件上传出错: ${error.message}`, false);
            }
        }

        // 其他方法保持不变，但使用this.modal和this.messagesContainer等
        async callAI(userMessage) {
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [
                            {role: "system", content: "You are a helpful assistant."}, 
                            ...this.messageHistory,
                            {role: 'user', content: userMessage}
                        ],
                        stream: true,
                        stream_options: {
                            include_usage: true
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error('API请求失败');
                }

                // 创建一个读取器来处理流式响应
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullContent = '';

                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    // 解码本次接收的数据
                    const chunk = decoder.decode(value);
                    // 处理数据块，每个数据块都是以 'data: ' 开头的
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const jsonData = JSON.parse(line.slice(6)); // 移除 'data: ' 前缀
                                if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                                    const content = jsonData.choices[0].delta.content;
                                    fullContent += content;
                                    // 可以在这里实现打字机效果，逐步显示内容
                                    // this.updateStreamingMessage(content);
                                }
                            } catch (e) {
                                // 忽略无效的JSON行
                                continue;
                            }
                        }
                    }
                }

                return fullContent;
            } catch (error) {
                console.error('AI调用出错:', error);
                if (error.message.includes('Failed to fetch')) {
                    return '网络连接错误，请检查您的网络连接。';
                }
                return `抱歉，发生了错误：${error.message}`;
            }
        }

        // 可选：添加一个方法来实现打字机效果
        updateStreamingMessage(content) {
            const lastMessage = this.messagesContainer.lastElementChild;
            if (lastMessage && lastMessage.classList.contains('ai')) {
                const textDiv = lastMessage.querySelector('div:not(.timestamp)');
                textDiv.textContent += content;
            }
        }

        async sendMessage() {
            const content = this.messageInput.value.trim();
            if (!content) return;

            this.messageInput.value = '';
            this.addMessage(content, true);
            this.messageHistory.push({
                role: 'user',
                content: content
            });

            // 禁用输入和发送
            this.messageInput.disabled = true;
            this.sendButton.disabled = true;

            // 创建一个新的消息div用于流式输出
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai';
            
            const textDiv = document.createElement('div');
            textDiv.className = 'message-content typing';  // 添加typing类
            
            const timestampDiv = document.createElement('div');
            timestampDiv.className = 'timestamp';
            timestampDiv.style.display = 'none';  // 初始隐藏时间戳
            
            messageDiv.appendChild(textDiv);
            messageDiv.appendChild(timestampDiv);
            this.messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();

            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [
                            {role: "system", content: "You are a helpful assistant."}, 
                            ...this.messageHistory,
                            {role: 'user', content: content}
                        ],
                        stream: true,
                        stream_options: {
                            include_usage: true
                        }
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`请求失败 [${response.status}]: ${errorData.error?.message || response.statusText || '未知错误'}\n\n详细信息：${JSON.stringify(errorData, null, 2)}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullContent = '';

                while (true) {
                    const {done, value} = await reader.read();
                    if (done) {
                        // 完成时移除typing类并显示时间戳
                        textDiv.classList.remove('typing');
                        timestampDiv.textContent = new Date().toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        timestampDiv.style.display = 'block';
                        break;
                    }

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const jsonData = JSON.parse(line.slice(6));
                                if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                                    const content = jsonData.choices[0].delta.content;
                                    fullContent += content;
                                    textDiv.innerHTML = this.formatMessage(fullContent);
                                    this.scrollToBottom();
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                    }
                }

                this.messageHistory.push({
                    role: 'assistant',
                    content: fullContent
                });

            } catch (error) {
                textDiv.classList.remove('typing');
                
                // 格式化错误信息
                let errorMessage = error.message;
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    errorMessage = '网络连接错误，请检查您的网络连接或API Key是否正确。';
                }
                
                // 显示格式化后的错误信息
                textDiv.innerHTML = `<span style="color: #ff4444;">❌ 错误信息：</span><br>${errorMessage}`;
                
                timestampDiv.textContent = new Date().toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                timestampDiv.style.display = 'block';
                console.error('AI调用出错:', error);
            } finally {
                // 恢复输入和发送
                this.messageInput.disabled = false;
                this.sendButton.disabled = false;
                this.messageInput.focus();
            }
        }

        // 添加格式化消息的方法
        formatMessage(content) {
            // 将换行符转换为<br>标签
            return content.replace(/\n/g, '<br>');
        }

        // 修改addMessage方法，主要用于添加用户消息
        addMessage(content, isUser) {
            if (!isUser) return; // AI消息由sendMessage方法处理

            const messageDiv = document.createElement('div');
            messageDiv.className = `message user`;
            
            const textDiv = document.createElement('div');
            textDiv.className = 'message-content';
            textDiv.innerHTML = this.formatMessage(content);
            
            const timestampDiv = document.createElement('div');
            timestampDiv.className = 'timestamp';
            timestampDiv.textContent = new Date().toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            messageDiv.appendChild(textDiv);
            messageDiv.appendChild(timestampDiv);
            
            this.messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
        }

        scrollToBottom() {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        clearHistory() {
            this.messagesContainer.innerHTML = '';
            this.messageHistory = [{
                role: "system",
                content: this.config.initialContent // 重新设置初始内容
            }]; // 如果希望保留提示词，可以在这里不重置内容
        }

        show() {
            this.API_KEY = localStorage.getItem('apiKey'); // 更新API_KEY
            if (!this.API_KEY) {
                loginModal.classList.add('show');
                apiKeyInput.focus();
                return;
            }
            this.modal.classList.add('show');
            this.messageInput.focus();
        }

        // 添加解密方法
        decryptContent(encrypted) {
            if(!encrypted) return null;
            try {
                // 使用 Base64 + 简单异或加密
                const key = "YOUR_SECRET_KEY"; // 需要保密的密钥
                const decoded = atob(encrypted);
                return decoded.split('').map((char, index) => 
                    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
                ).join('');
            } catch(e) {
                console.error('解密失败');
                return null;
            }
        }

        async initializeConfig(cardId) {
            try {
                const response = await fetch('/api/get-card-config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cardId })
                });
                
                const config = await response.json();
                this.config = config; // 存储配置以便在清除历史记录时使用
                this.messageHistory = [{
                    role: "system",
                    content: config.initialContent
                }];
            } catch(e) {
                console.error('获取配置失败');
            }
        }
    }

    // 搜索功能代码
    const searchInput = document.querySelector('.search-container input');
    const appCards = document.querySelectorAll('.app-card');
    
    // 存储每个卡片的聊天实例
    const chatInstances = new Map();

    // 为每个卡片创建独立的聊天实例
    appCards.forEach(card => {
        chatInstances.set(card, new ChatApp(card)); // 传递initialContent

        card.addEventListener('click', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.98)';
            
            // 获取该卡片对应的聊天实例并显示
            const chatInstance = chatInstances.get(this);
            chatInstance.show();

            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });

    // 搜索功能实现
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        appCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
            card.style.display = isVisible ? 'block' : 'none';
        });
    });

    // 为所有卡片描述添加完整文本属性
    const descriptions = document.querySelectorAll('.app-card p');
    descriptions.forEach(p => {
        p.setAttribute('data-full-text', p.textContent);
    });
});