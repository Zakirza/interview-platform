import type { FactualQuestion } from "./types";

export const seedFactualQuestions: FactualQuestion[] = [
  {
    id: "bias-variance",
    topic: "general-ml",
    question: "What is the trade-off between bias and variance?",
    answerKey:
      "High bias usually means the model is too simple and underfits. High variance usually means the model is too sensitive to training data and overfits. A good model balances both through model choice, regularization, data, and validation.",
    source: "mlquestions"
  },
  {
    id: "regularization",
    topic: "general-ml",
    question: "What is regularization, and why do we use it?",
    answerKey:
      "Regularization discourages overly complex models to reduce overfitting. Common examples include L1/Lasso, which can drive weights to zero, and L2/Ridge, which shrinks weights.",
    source: "mlquestions"
  },
  {
    id: "batch-normalization",
    topic: "deep-learning",
    question: "What is batch normalization, and why can it help training?",
    answerKey:
      "Batch normalization normalizes layer activations within a mini-batch, then applies learned scale and shift parameters. It can stabilize optimization, permit higher learning rates, and reduce sensitivity to initialization.",
    source: "mlquestions"
  },
  {
    id: "rag-chunking",
    topic: "nlp",
    question: "What are common chunking strategies in retrieval augmented generation, and what are their trade-offs?",
    answerKey:
      "Common strategies include fixed-size chunks, semantic chunks, sentence or paragraph chunks, and overlapping windows. Smaller chunks improve precision but may lose context; larger chunks preserve context but can reduce retrieval specificity.",
    source: "generated"
  },
  {
    id: "hnsw-ivf",
    topic: "vector-search",
    question: "Compare HNSW and IVF Flat for approximate nearest-neighbor search.",
    answerKey:
      "HNSW uses a navigable small-world graph and often gives strong recall with low latency at higher memory cost. IVF Flat clusters vectors into lists and searches selected clusters, often using less memory but depending heavily on clustering and probe count.",
    source: "generated"
  }
];

export function retrieveQuestions(domains: string[], limit = 5) {
  const normalized = domains.map((domain) => domain.toLowerCase());
  const scored = seedFactualQuestions.map((item) => {
    const score = normalized.some((domain) => item.topic.includes(domain) || domain.includes(item.topic)) ? 2 : 1;
    return { item, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}
