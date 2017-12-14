require 'spec_helper'

describe StorageShard do
  describe '.current_shards' do
    it 'returns an array of StorageShard objects' do
      shards = described_class.current_shards

      expect(shards.count).to eq(Settings.repositories.storages.count)
      expect(shards.map(&:name)).to match_array(Settings.repositories.storages.keys)
      expect(shards.map(&:path)).to match_array(Settings.repositories.storages.values.map { |x| x.path })
    end
  end
end
