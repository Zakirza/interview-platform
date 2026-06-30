# ML Engineering Question Bank Seed

Source basis: https://github.com/andrewekhalel/MLQuestions

This file is the first local corpus for Phase 4 factual interview questions. The app currently uses a typed seed list in `lib/interview/question-bank.ts`; the next implementation step is to parse this markdown into `question_bank_items` and add similarity search.

## General Machine Learning

### What is the trade-off between bias and variance?

Answer key: High-bias models are usually too simple and underfit. High-variance models are usually too sensitive to the training data and overfit. Good ML engineering balances both through model selection, regularization, validation, and data quality.

Tags: general-ml, modeling, evaluation

### What is gradient descent?

Answer key: Gradient descent is an optimization algorithm that iteratively updates model parameters in the direction that reduces a loss function. It is useful when parameters cannot be solved analytically or when optimizing large differentiable models.

Tags: optimization, general-ml

### What is regularization, and why do we use it?

Answer key: Regularization discourages unnecessary model complexity to reduce overfitting. L2 regularization shrinks weights, while L1 regularization can drive some weights to zero and create sparse models.

Tags: general-ml, overfitting

### Why do we need validation and test sets?

Answer key: A validation set supports model and hyperparameter selection during development. A test set estimates final generalization on data not used for model selection.

Tags: evaluation, general-ml

## Deep Learning

### Why is ReLU often preferred over sigmoid in hidden layers?

Answer key: ReLU is computationally simple and reduces vanishing-gradient issues for positive activations. Sigmoid saturates for large positive or negative inputs, which can make gradients very small.

Tags: deep-learning, activations

### What is batch normalization?

Answer key: Batch normalization normalizes activations within a mini-batch and then applies learned scale and shift parameters. It can stabilize training, allow higher learning rates, and reduce sensitivity to initialization.

Tags: deep-learning, optimization

### What is the significance of residual connections?

Answer key: Residual connections make it easier for gradients and information to flow through deep networks by allowing layers to learn residual functions around an identity path.

Tags: deep-learning, architecture

## Computer Vision

### Why use convolutions for images instead of only fully connected layers?

Answer key: Convolutions preserve local spatial structure, share parameters across locations, reduce parameter count, and provide useful translation-related inductive bias.

Tags: computer-vision, cnn

### What determines the output shape of a convolution layer?

Answer key: Output shape depends on input size, kernel size, stride, padding, dilation, and number of filters.

Tags: computer-vision, cnn

### What is non-maximum suppression?

Answer key: Non-maximum suppression removes duplicate overlapping detections by sorting boxes by confidence and suppressing lower-confidence boxes whose overlap exceeds a threshold.

Tags: computer-vision, object-detection

## NLP and Retrieval

### What is retrieval augmented generation?

Answer key: RAG retrieves relevant external context and supplies it to a generative model so the answer can be grounded in information outside the model weights.

Tags: nlp, rag, llm

### What are common chunking strategies in RAG?

Answer key: Common strategies include fixed-size chunks, overlapping windows, paragraph or sentence chunks, and semantic chunks. Smaller chunks improve precision but can lose context; larger chunks preserve context but may reduce retrieval specificity.

Tags: nlp, rag, retrieval

### Compare HNSW and IVF Flat.

Answer key: HNSW uses a graph structure and often provides strong recall and low latency with higher memory usage. IVF Flat partitions vectors into clusters and searches selected lists, trading recall and speed based on the number of probes.

Tags: vector-search, rag, retrieval

### What is cosine similarity?

Answer key: Cosine similarity measures the cosine of the angle between two vectors. It is computed as dot(a, b) divided by the product of their vector norms.

Tags: vector-search, math
