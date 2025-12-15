import { CommandParser } from '@redis/client/dist/lib/client/parser';
import { RedisArgument, ReplyUnion } from '@redis/client/dist/lib/RESP/types';
import { RedisVariadicArgument } from '@redis/client/dist/lib/commands/generic-transformers';
import { FtSearchParams } from './SEARCH';
export interface FtHybridSearchExpression {
    query: RedisArgument;
    SCORER?: {
        algorithm: RedisArgument;
        params?: Array<RedisArgument>;
    };
    YIELD_SCORE_AS?: RedisArgument;
}
export interface FtHybridVectorMethod {
    KNN?: {
        K: number;
        EF_RUNTIME?: number;
        YIELD_DISTANCE_AS?: RedisArgument;
    };
    RANGE?: {
        RADIUS: number;
        EPSILON?: number;
        YIELD_DISTANCE_AS?: RedisArgument;
    };
}
export interface FtHybridVectorExpression {
    field: RedisArgument;
    vectorData: RedisArgument;
    method?: FtHybridVectorMethod;
    FILTER?: {
        expression: RedisArgument;
        POLICY?: 'ADHOC' | 'BATCHES' | 'ACORN';
        BATCHES?: {
            BATCH_SIZE: number;
        };
    };
    YIELD_SCORE_AS?: RedisArgument;
}
export interface FtHybridCombineMethod {
    RRF?: {
        count: number;
        WINDOW?: number;
        CONSTANT?: number;
    };
    LINEAR?: {
        count: number;
        ALPHA?: number;
        BETA?: number;
    };
    FUNCTION?: RedisArgument;
}
export interface FtHybridOptions {
    SEARCH?: FtHybridSearchExpression;
    VSIM?: FtHybridVectorExpression;
    COMBINE?: {
        method: FtHybridCombineMethod;
        YIELD_SCORE_AS?: RedisArgument;
    };
    LOAD?: RedisVariadicArgument;
    GROUPBY?: {
        fields: RedisVariadicArgument;
        REDUCE?: {
            function: RedisArgument;
            count: number;
            args: Array<RedisArgument>;
        };
    };
    APPLY?: {
        expression: RedisArgument;
        AS: RedisArgument;
    };
    SORTBY?: {
        count: number;
        fields: Array<{
            field: RedisArgument;
            direction?: 'ASC' | 'DESC';
        }>;
    };
    FILTER?: RedisArgument;
    LIMIT?: {
        offset: number | RedisArgument;
        num: number | RedisArgument;
    };
    PARAMS?: FtSearchParams;
    EXPLAINSCORE?: boolean;
    TIMEOUT?: number;
    WITHCURSOR?: {
        COUNT?: number;
        MAXIDLE?: number;
    };
}
declare const _default: {
    readonly NOT_KEYED_COMMAND: true;
    readonly IS_READ_ONLY: true;
    /**
     * Performs a hybrid search combining multiple search expressions.
     * Supports multiple SEARCH and VECTOR expressions with various fusion methods.
     *
     * @experimental
     * NOTE: FT.Hybrid is still in experimental state
     * It's behaviour and function signature may change
     *
     * @param parser - The command parser
     * @param index - The index name to search
     * @param options - Hybrid search options including:
     *   - SEARCH: Text search expression with optional scoring
     *   - VSIM: Vector similarity expression with KNN/RANGE methods
     *   - COMBINE: Fusion method (RRF, LINEAR, FUNCTION)
     *   - Post-processing operations: LOAD, GROUPBY, APPLY, SORTBY, FILTER
     *   - Tunable options: LIMIT, PARAMS, EXPLAINSCORE, TIMEOUT, WITHCURSOR
     */
    readonly parseCommand: (this: void, parser: CommandParser, index: RedisArgument, options?: FtHybridOptions) => void;
    readonly transformReply: {
        readonly 2: (reply: any) => any;
        readonly 3: () => ReplyUnion;
    };
    readonly unstableResp3: true;
};
export default _default;
//# sourceMappingURL=HYBRID.d.ts.map