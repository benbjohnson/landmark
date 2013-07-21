class ResourceHit < ActiveRecord::Base
  belongs_to :resource
  validates :resource_id, :hit_date, :count, presence: true  
  validates :hit_date, uniqueness: {scope: :resource_id}
  attr_accessible :count
end
