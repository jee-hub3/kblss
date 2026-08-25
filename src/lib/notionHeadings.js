/**
 * 노션 본문 헤딩의 "태그 레벨"을 문서별로 정규화한다.
 *
 * 왜 필요한가 —
 * 상세 페이지의 제목이 이미 h1이라 본문 헤딩은 h2부터 시작해야 한다.
 * 그런데 블록 타입을 태그에 1:1로 고정하면(heading_1=h1 …) 두 가지가 깨진다.
 *   1) 작성자가 제목1을 쓰면 페이지에 h1이 둘이 된다
 *      (axe의 page-has-heading-one은 "하나 이상"만 봐서 감사에 안 잡힌다)
 *   2) 작성자가 제목3만 쓰면 h1 다음이 h3/h4가 되어 레벨이 건너뛴다
 * 고정 오프셋(항상 한 단계)은 1)만 풀고 2)는 남는다.
 *
 * 그래서 "그 문서에서 실제로 쓰인 레벨"만 모아 h2부터 순서대로 배정한다.
 *   [3]        → heading_3 = h2
 *   [1, 2, 3]  → 1=h2, 2=h3, 3=h4
 *   [1, 3]     → 1=h2, 3=h3
 * 작성자가 만든 상대 위계는 그대로 보존되고, 어떤 레벨부터 쓰든 건너뜀이 없다.
 *
 * ★ 태그와 시각 크기는 분리한다. 크기는 지금처럼 블록 타입으로 정하므로
 *   (heading_1=큰 스타일, heading_3=작은 스타일) 화면은 바뀌지 않는다.
 *   푸터 h3→h2, 조직 카드 h4→h2에서 쓴 것과 같은 원칙이다.
 */

/** 노션 헤딩 블록 타입 — 배열 순서가 곧 레벨(1,2,3)이다. */
const HEADING_TYPES = ['heading_1', 'heading_2', 'heading_3'];

/** 헤딩 태그가 내려갈 수 있는 가장 깊은 단계 */
const MAX_TAG_LEVEL = 6;

/**
 * 블록 배열을 훑어 { 노션레벨: 태그명 } 매핑을 만든다.
 * 렌더 직전에 한 번만 계산해서 넘긴다 — 블록 하나만 봐서는 알 수 없기 때문.
 */
export function buildHeadingTagMap(blocks) {
    const usedLevels = new Set();
    for (const block of blocks || []) {
        const index = HEADING_TYPES.indexOf(block?.type);
        if (index !== -1) usedLevels.add(index + 1);
    }

    const map = {};
    [...usedLevels]
        .sort((a, b) => a - b)
        .forEach((level, order) => {
            map[level] = `h${Math.min(order + 2, MAX_TAG_LEVEL)}`;
        });
    return map;
}

/**
 * 블록 타입에 대응하는 태그명을 돌려준다.
 * 매핑에 없으면(계산 전이거나 예상 밖 타입) h2로 떨어뜨린다 —
 * 페이지 h1 바로 아래라 어떤 경우에도 건너뜀이 생기지 않는 안전한 기본값.
 */
export function headingTagFor(map, type) {
    const level = HEADING_TYPES.indexOf(type) + 1;
    return (map && map[level]) || 'h2';
}
