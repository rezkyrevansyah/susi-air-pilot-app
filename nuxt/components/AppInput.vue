<template>
  <div
    class="field"
    :class="{ 'field--error': error, 'field--disabled': disabled }"
  >
    <label :for="id" class="field__label">{{ label }}</label>
    <div class="field__box">
      <component :is="icon" class="field__icon" aria-hidden="true" />
      <input
        :id="id"
        ref="input"
        v-model="model"
        :type="isPassword && !revealed ? 'password' : 'text'"
        :name="name"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        :aria-describedby="`${id}-hint`"
        autocapitalize="none"
        spellcheck="false"
        class="field__input"
      />
      <button
        v-if="isPassword"
        type="button"
        class="field__toggle"
        :aria-label="revealed ? 'Hide password' : 'Show password'"
        :aria-pressed="revealed"
        :disabled="disabled"
        @click="revealed = !revealed"
      >
        <component :is="revealed ? EyeOff : Eye" aria-hidden="true" />
      </button>
    </div>
    <p :id="`${id}-hint`" class="field__hint">
      <CircleAlert v-if="error" aria-hidden="true" />
      {{ error || hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { CircleAlert, Eye, EyeOff } from 'lucide-vue-next';

const props = defineProps<{
  label: string;
  name: string;
  icon: Component;
  type?: 'text' | 'password';
  placeholder?: string;
  hint?: string;
  error?: string;
  autocomplete?: string;
  disabled?: boolean;
}>();

const model = defineModel<string>({ required: true });
const id = useId();
const input = useTemplateRef<HTMLInputElement>('input');
const revealed = ref(false);
const isPassword = computed(() => props.type === 'password');

defineExpose({ focus: () => input.value?.focus() });
</script>

<style scoped lang="scss">
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  @include text(13px, 16px, 700);
}

.field__box {
  display: flex;
  align-items: center;
  gap: $space-3;
  height: 52px;
  padding: 0 $space-4;
  background: $surface;
  border-radius: $radius-field;
  box-shadow: inset 0 0 0 1.5px $border-strong;
  transition: box-shadow 0.15s;

  &:focus-within {
    box-shadow: inset 0 0 0 2px $navy;
  }

  .field:has(.field__toggle) & {
    padding-right: $space-1;
  }

  .field--error & {
    box-shadow: inset 0 0 0 2px $danger;
  }

  .field--disabled & {
    background: #f0f2f5;
  }
}

.field__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: $muted;

  .field--error & {
    color: $danger-ink;
  }
}

.field__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: $muted;
  }

  &:disabled {
    color: $disabled-ink;
  }
}

.field__toggle {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: $muted;

  svg {
    width: 20px;
    height: 20px;
  }

  &:active {
    background: $navy-tint;
  }
}

.field__hint {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $muted;
  @include text(12px, 16px, 500);

  svg {
    width: 14px;
    height: 14px;
  }

  .field--error & {
    color: $danger-ink;
    font-weight: 600;
  }
}
</style>
